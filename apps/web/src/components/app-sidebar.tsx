import * as React from "react";

import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Tasks } from "./tasks/tasks";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="relative flex flex-col">
        <SidebarGroup className="sticky top-0 px-0 z-10 bg-sidebar">
          <SidebarGroupContent>
            <DatePicker />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="flex-1 flex flex-col min-h-0">
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <Tasks />
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
