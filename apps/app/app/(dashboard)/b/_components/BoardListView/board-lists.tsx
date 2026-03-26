"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useState } from "react";

import { listTitleFromId } from "../ListWrapper/list-title";
import { ListWrapper } from "../ListWrapper/list-wrapper";

const initialListIds = ["list-1", "list-2", "list-3", "list-4"];

export const BoardLists = () => {
  const [listIds, setListIds] = useState(initialListIds);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setListIds((items) => {
      const from = items.indexOf(String(active.id));
      const to = items.indexOf(String(over.id));
      if (from === -1 || to === -1) return items;
      return arrayMove(items, from, to);
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
        <ul className="flex list-none gap-4 p-0">
          {listIds.map((id) => (
            <ListWrapper key={id} id={id} title={listTitleFromId(id)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
