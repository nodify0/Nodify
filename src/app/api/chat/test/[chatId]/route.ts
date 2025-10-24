import { NextRequest, NextResponse } from 'next/server';
import { chatRegistry, chatMessages, workflowExecutions, executionEvents } from '@/lib/db/sqlite';
import { randomBytes } from 'crypto';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from '@/firebase/config';
import { ServerWorkflowExecutor } from '@/lib/server-workflow-executor';

// Initialize Firebase Client SDK for server-side usage
let clientDb: any = null;
let storage: any = null;

if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  clientDb = getFirestore(app);
  storage = getStorage(app);
} else {
  const app = getApps()[0];
  clientDb = getFirestore(app);
  storage = getStorage(app);
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  metadata?: any;
  files?: any[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  files?: any[];
}

/**
 * Test Chat Handler
 * Executes workflow and waits for response (synchronous)
 */
async function handleChatRequest(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;

  console.log(`[Chat:Test] Received message for chatId: ${chatId}`);

  try {
    // 1. Fast lookup from SQLite
    const chat = chatRegistry.getById(chatId);

    if (!chat) {
      console.log('[Chat:Test] Chat not found:', chatId);
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    console.log('[Chat:Test] Found chat:', {
      workflowId: chat.workflow_id,
      userId: chat.user_id,
      status: chat.status
    });

    // 2. Parse request body (JSON or FormData)
    const contentType = request.headers.get('content-type') || '';
    let message = '';
    let sessionId = 'default';
    let metadata: any = {};
    let uploadedFiles: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      message = formData.get('message') as string || '';
      sessionId = formData.get('sessionId') as string || 'default';
      const metadataStr = formData.get('metadata') as string;
      if (metadataStr) {
        try {
          metadata = JSON.parse(metadataStr);
        } catch (e) {
          metadata = {};
        }
      }

      // Process files
      const files = formData.getAll('files') as File[];
      for (const file of files) {
        if (file && file.size > 0) {
          try {
            // Upload to Firebase Storage
            const fileId = `chat_${chatId}_${Date.now()}_${randomBytes(4).toString('hex')}`;
            const fileRef = ref(storage, `chat-files/${chat.user_id}/${fileId}_${file.name}`);
            const buffer = await file.arrayBuffer();
            await uploadBytes(fileRef, buffer, {
              contentType: file.type
            });
            const downloadURL = await getDownloadURL(fileRef);

            uploadedFiles.push({
              id: fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL
            });
            console.log(`[Chat:Test] Uploaded file: ${file.name}`);
          } catch (fileError) {
            console.error(`[Chat:Test] Failed to upload file ${file.name}:`, fileError);
          }
        }
      }
    } else {
      // Handle JSON
      const body: ChatRequest = await request.json();
      message = body.message;
      sessionId = body.sessionId || 'default';
      metadata = body.metadata || {};
      uploadedFiles = body.files || [];
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('[Chat:Test] Message:', message);
    console.log('[Chat:Test] Session:', sessionId);
    console.log('[Chat:Test] Files:', uploadedFiles.length);

    // 3. Save user message
    const userMessageId = `msg_${Date.now()}_${randomBytes(4).toString('hex')}`;
    chatMessages.create({
      chatId,
      sessionId,
      messageId: userMessageId,
      role: 'user',
      content: message,
      mode: 'test',
      metadata,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    });

    // 4. Fetch workflow data from Firestore
    const workflowRef = doc(clientDb, 'users', chat.user_id, 'workflows', chat.workflow_id);
    const workflowSnap = await getDoc(workflowRef);

    if (!workflowSnap.exists()) {
      console.error('[Chat:Test] Workflow document not found in Firestore');
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflowData = workflowSnap.data();
    const serverWorkflow = {
      id: chat.workflow_id,
      name: workflowData.name || 'Unnamed Workflow',
      status: workflowData.status || 'active',
      nodes: workflowData.nodes || [],
      connections: workflowData.connections || []
    };

    console.log('[Chat:Test] Fetched workflow:', {
      id: serverWorkflow.id,
      name: serverWorkflow.name,
      nodeCount: serverWorkflow.nodes.length,
      connectionCount: serverWorkflow.connections.length
    });

    // 5. Find chat trigger node
    const chatNode = serverWorkflow.nodes.find(
      (n: any) => n.type === 'chat_trigger' && n.config?.chatId === chatId
    );

    if (!chatNode) {
      console.error('[Chat:Test] Chat trigger node not found in workflow');
      return NextResponse.json(
        { error: 'Chat trigger node not found' },
        { status: 404 }
      );
    }

    console.log('[Chat:Test] Found chat node:', chatNode.id);

    // 6. Create execution record
    const executionId = `exec_${Date.now()}_${randomBytes(8).toString('hex')}`;

    workflowExecutions.create({
      id: executionId,
      workflowId: chat.workflow_id,
      userId: chat.user_id,
      mode: 'test',
      trigger: 'chat',
      webhookData: {
        message,
        sessionId,
        userId: 'test_user',
        timestamp: new Date().toISOString(),
        metadata
      }
    });

    console.log('[Chat:Test] Created execution:', executionId);

    // 7. Execute workflow and wait for response
    const executor = new ServerWorkflowExecutor(serverWorkflow, {
      onEvent: (event: any) => {
        try {
          if (event.type === 'workflow_start') {
            executionEvents.create({
              executionId,
              eventType: 'workflow_start',
              data: event
            });
          } else if (event.type === 'node_start') {
            executionEvents.create({
              executionId,
              eventType: 'node_start',
              nodeId: event.nodeId,
              data: event
            });
          } else if (event.type === 'node_end') {
            executionEvents.create({
              executionId,
              eventType: 'node_end',
              nodeId: event.nodeId,
              data: event
            });
          } else if (event.type === 'edge_traverse') {
            executionEvents.create({
              executionId,
              eventType: 'edge_traverse',
              edgeId: event.edgeId,
              data: event
            });
          } else if (event.type === 'workflow_end') {
            executionEvents.create({
              executionId,
              eventType: 'workflow_end',
              data: event
            });
          }
        } catch (err) {
          console.error('[Chat:Test] Failed to save event:', err);
        }
      }
    });

    // Execute workflow and WAIT for result (synchronous for chat)
    const chatData = {
      message,
      sessionId,
      userId: 'test_user',
      timestamp: new Date().toISOString(),
      metadata,
      files: uploadedFiles
    };

    console.log('[Chat:Test] Executing workflow...');
    console.log('[Chat:Test] Starting from chat node:', chatNode.id);
    console.log('[Chat:Test] Input data:', chatData);

    const executionContext = await executor.execute(chatNode.id, chatData);

    console.log('[Chat:Test] Workflow execution completed');
    console.log('[Chat:Test] Execution context keys:', Object.keys(executionContext));

    // Find the last executed node (excluding the chat trigger itself)
    const executedNodeIds = Object.keys(executionContext).filter(id => id !== chatNode.id);
    console.log('[Chat:Test] Executed nodes (excluding trigger):', executedNodeIds);

    let result: any = null;
    if (executedNodeIds.length > 0) {
      // Get the output of the last node
      const lastNodeId = executedNodeIds[executedNodeIds.length - 1];
      result = executionContext[lastNodeId]?.output;
      console.log('[Chat:Test] Last node ID:', lastNodeId);
      console.log('[Chat:Test] Last node output:', JSON.stringify(result, null, 2));
    } else {
      // No nodes after chat trigger, use chat trigger output
      result = executionContext[chatNode.id]?.output;
      console.log('[Chat:Test] No nodes after chat trigger, using trigger output');
    }

    // 8. Extract response and files from the last node's output
    let responseContent = 'No response generated';
    let responseFiles: any[] = [];

    if (!result) {
      console.warn('[Chat:Test] No output from workflow execution');
      responseContent = 'Workflow executed but no output was generated';
    } else {
      // Extract files from result
      if (result?.files && Array.isArray(result.files)) {
        responseFiles = result.files;
      } else if (result?.data?.files && Array.isArray(result.data.files)) {
        responseFiles = result.data.files;
      } else if (result?.file) {
        responseFiles = [result.file];
      } else if (result?.data?.file) {
        responseFiles = [result.data.file];
      }

      // Try to get response from common output fields
      if (result?.message) {
        responseContent = result.message;
      } else if (result?.response) {
        responseContent = result.response;
      } else if (result?.text) {
        responseContent = result.text;
      } else if (result?.data?.message) {
        responseContent = result.data.message;
      } else if (result?.data?.response) {
        responseContent = result.data.response;
      } else if (result?.data?.text) {
        responseContent = result.data.text;
      } else if (typeof result === 'string') {
        responseContent = result;
      } else if (result && !responseFiles.length) {
        // If result is an object and no files, stringify it
        responseContent = JSON.stringify(result, null, 2);
      }
    }

    console.log('[Chat:Test] Response content:', responseContent);
    console.log('[Chat:Test] Response files:', responseFiles.length);

    // 9. Save assistant message
    const assistantMessageId = `msg_${Date.now()}_${randomBytes(4).toString('hex')}`;
    chatMessages.create({
      chatId,
      sessionId,
      messageId: assistantMessageId,
      role: 'assistant',
      content: responseContent,
      mode: 'test',
      executionId,
      metadata: { result },
      files: responseFiles.length > 0 ? responseFiles : undefined
    });

    // 10. Return response
    return NextResponse.json({
      success: true,
      message: responseContent,
      files: responseFiles,
      messageId: assistantMessageId,
      executionId,
      sessionId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Chat:Test] Error processing chat message:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST endpoint for chat messages
export const POST = handleChatRequest;

// GET endpoint to retrieve chat history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId') || 'default';

  try {
    const chat = chatRegistry.getById(chatId);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Get messages for this session
    const messages = chatMessages.getBySession(chatId, sessionId);

    return NextResponse.json({
      success: true,
      chatId,
      sessionId,
      messages: messages.map(m => ({
        id: m.message_id,
        role: m.role,
        content: m.content,
        files: m.files || [],
        timestamp: m.timestamp * 1000 // Convert to milliseconds
      }))
    });
  } catch (error) {
    console.error('[Chat:Test] Error retrieving chat history:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
