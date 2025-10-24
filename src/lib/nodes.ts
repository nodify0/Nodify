import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleDot } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { CustomNode } from './custom-nodes-types';
import { NODE_GROUP_ICONS, NODE_TYPE_ICONS as BUILT_IN_ICONS } from './icons';

const toPascalCase = (str: string): string => {
  if (!str) return '';
  return str.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const validateNode = (node: any, source: string): node is CustomNode => {
  const required = ['id','name','version'];
  const missing = required.filter(f => !node[f]);
  if (missing.length) {
    console.error(`[NodeLoader] Invalid node from ${source}: missing fields:`, missing);
    return false;
  }
  if (node.executionCode && typeof node.executionCode !== 'string') {
    console.error(`[NodeLoader] Invalid node ${node.id}: executionCode must be a string`);
    return false;
  }
  if (!Array.isArray(node.inputs)) node.inputs = [{ id: 'main', label: 'Input', position: 'left', type: 'any' }];
  if (!Array.isArray(node.outputs)) node.outputs = [{ id: 'main', label: 'Output', position: 'right', type: 'any' }];
  if (!Array.isArray(node.properties)) node.properties = [];
  return true;
};

const prepareExecutionCode = (code: string): string => {
  if (!code) return '';
  let c = code.trim();
  if ((c.startsWith('"') && c.endsWith('"')) || (c.startsWith("'") && c.endsWith("'"))) c = c.slice(1,-1);
  return c
    .replace(/\\n/g,'\n')
    .replace(/\\t/g,'\t')
    .replace(/\\r/g,'\r')
    .replace(/\\"/g,'"')
    .replace(/\\'/g,"'")
    .replace(/\\\\/g,'\\');
};

// Load all JSON node definitions
const nodeContext = require.context('../nodes', true, /\.json$/);
// Load JS/TS execution files
const jsContext = require.context('../nodes', true, /\.(js|ts)$/);

const allNodes: CustomNode[] = [];
const loadErrors: Array<{ file: string; error: string }> = [];

nodeContext.keys().forEach((key: string) => {
  try {
    const mod = nodeContext(key);
    const nodeData: any = mod.default || mod;
    if (!validateNode(nodeData, key)) { loadErrors.push({ file: key, error: 'Validation failed' }); return; }

    if (nodeData.executionFile === true) {
      const candidates = [key.replace('.json','.js'), key.replace('.json','.ts')];
      try {
        const keys = jsContext.keys();
        const found = candidates.find(c => keys.includes(c));
        if (found) {
          const jsMod = jsContext(found);
          const execVal = (jsMod.default !== undefined) ? jsMod.default : jsMod;
          if (typeof execVal === 'function') nodeData.executionCode = execVal.toString();
          else if (typeof execVal === 'string') nodeData.executionCode = execVal;
          else { console.error(`[NodeLoader] Invalid executionFile for ${nodeData.id}: must export default string or function`); nodeData.executionCode = ''; }
          console.log(`[NodeLoader] V Loaded execution file: ${found}`);
        } else {
          console.error(`[NodeLoader] executionFile not found for ${nodeData.id}: tried ${candidates.join(', ')}`);
          loadErrors.push({ file: key, error: `executionFile specified but none of ${candidates.join(', ')} found` });
          return;
        }
      } catch (e) {
        console.error(`[NodeLoader] ? Failed to load execution file for ${nodeData.id}:`, e);
        loadErrors.push({ file: candidates.join(', '), error: e instanceof Error ? e.message : 'Unknown error' });
        return;
      }
    } else if (nodeData.executionCode) {
      nodeData.executionCode = prepareExecutionCode(nodeData.executionCode);
    }

    nodeData.group = nodeData.group || 'Other';
    nodeData.category = nodeData.category || 'other';
    nodeData.shape = nodeData.shape || 'rectangle';
    nodeData.color = nodeData.color || '#6B7280';
    nodeData.icon = nodeData.icon || 'Box';

    allNodes.push(nodeData as CustomNode);
  } catch (e) {
    console.error(`[NodeLoader] ? Failed to load node from ${key}:`, e);
    loadErrors.push({ file: key, error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

console.log(`[NodeLoader] Loaded ${allNodes.length} nodes successfully`);
if (loadErrors.length > 0) console.warn(`[NodeLoader] Failed to load ${loadErrors.length} nodes:`, loadErrors);

const nodesById = allNodes.reduce((acc, n) => { if (!acc[n.id]) acc[n.id] = n; return acc; }, {} as Record<string, CustomNode>);

export const getNodeDefinition = (type: string): CustomNode | undefined => nodesById[type];
export const getAllNodes = (): CustomNode[] => [...allNodes];

export const getNodeIcon = (nodeOrId: string | CustomNode): any => {
  const node = typeof nodeOrId === 'string' ? nodesById[nodeOrId] : nodeOrId;
  if (node && (node as any).customIcon) {
    const src = (node as any).customIcon as string;
    return (props: { className?: string; style?: React.CSSProperties }) => React.createElement('img', { src, alt: node.name || 'icon', className: props.className, style: props.style });
  }
  if (!node || !node.icon) return CircleDot;
  const name = node.icon as string;
  const vars = [name, toPascalCase(name), name.charAt(0).toUpperCase()+name.slice(1)];
  for (const v of vars) {
    const Icon = (LucideIcons as any)[v] as LucideIcon;
    if (Icon) return Icon;
  }
  const BuiltIn = (BUILT_IN_ICONS as any)[name] as LucideIcon;
  return BuiltIn || CircleDot;
};

export const nodeGroups = allNodes.reduce((acc: any[], node) => {
  let g = acc.find(x => x.name === node.group);
  if (!g) { g = { name: node.group, icon: NODE_GROUP_ICONS[node.group] || CircleDot, nodes: [] }; acc.push(g); }
  g.nodes.push(node);
  return acc;
}, [] as Array<{ name: string; icon: LucideIcon; nodes: CustomNode[] }>);

