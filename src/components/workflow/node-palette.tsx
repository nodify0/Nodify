
"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { nodeGroups, getNodeIcon } from "@/lib/nodes";
import type { CustomNode } from "@/lib/custom-nodes-types";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ChevronDown, ChevronRight } from "lucide-react";

type NodePaletteProps = {
  onAddNode: (nodeDefinition: CustomNode) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hasTriggerNode: boolean;
};

// Category badge colors
const categoryColors: Record<string, string> = {
  trigger: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  action: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  logic: "bg-green-500/10 text-green-600 border-green-500/20",
  data: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ai: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function NodePalette({ onAddNode, isOpen, setIsOpen, hasTriggerNode }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const filteredGroups = nodeGroups
    .map(group => ({
      ...group,
      nodes: group.nodes.filter(node => {
        // Filter by search term
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase());

        // If there's no trigger node, only show trigger nodes
        if (!hasTriggerNode) {
          return matchesSearch && node.category === 'trigger';
        }

        // If there's already a trigger, show all nodes
        return matchesSearch;
      }),
    }))
    .filter(group => group.nodes.length > 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:w-[420px] flex flex-col p-0" side="right">
            <SheetHeader className="p-4 border-b">
                <SheetTitle>Add a node</SheetTitle>
                <SheetDescription>
                  {!hasTriggerNode
                    ? "First, add a trigger node to start your workflow."
                    : "Select a node to add to your workflow."}
                </SheetDescription>
            </SheetHeader>
            <div className="p-4">
                <Input 
                    placeholder="Search nodes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
            </div>
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 pb-4">
                {filteredGroups.map(group => {
                    const isCollapsed = collapsedGroups.has(group.name);
                    const ChevronIcon = isCollapsed ? ChevronRight : ChevronDown;

                    return (
                    <div key={group.name} className="space-y-2">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.name)}
                            className="w-full text-sm font-semibold flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                        >
                            <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <group.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{group.name}</span>
                            <Badge variant="secondary" className="ml-auto text-xs h-5">
                                {group.nodes.length}
                            </Badge>
                        </button>

                        {/* Group Nodes */}
                        {!isCollapsed && (
                            <div className="grid grid-cols-1 gap-2">
                                {group.nodes.map((def) => {
                                    const Icon = getNodeIcon(def);
                                    const categoryColor = categoryColors[def.category] || categoryColors.other;

                                    return (
                                        <button
                                            key={def.id}
                                            onClick={() => onAddNode(def)}
                                            className="w-full text-left group/node"
                                        >
                                            <div className="p-3 rounded-lg bg-card hover:bg-secondary transition-all flex gap-3 items-start border border-border/50 hover:border-border hover:shadow-sm">
                                                {/* Icon */}
                                                <div
                                                    className="p-2 rounded-md flex-shrink-0 transition-transform group-hover/node:scale-110 overflow-hidden"
                                                    style={{backgroundColor: `${def.color}15`}}
                                                >
                                                    <Icon className="h-4 w-4 object-contain" style={{ color: def.color }} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2 mb-1">
                                                        <p className="font-semibold text-sm capitalize flex-1">
                                                            {def.name}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] px-1.5 py-0 h-4 ${categoryColor} flex-shrink-0`}
                                                        >
                                                            {def.category}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {def.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    )
                })}
                </div>
            </ScrollArea>
        </SheetContent>
    </Sheet>
  );
}
