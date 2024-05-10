"use client"
import * as React from "react"
import { CheckIcon, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { useEffect, useState } from "react";
import { useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient()




interface CategoryFilterProps {
    title?: string;
    table: string;
    id: string;
    count: string;
    onSelectedOptionsChange: (selectedOptions: string[]) => void;
    params?: URLSearchParams
    className?: string;
}

interface CategoryOption {
    id: string;
    name: string;
    count: number;
}




export function FilterLight({
    title,
    table,
    onSelectedOptionsChange,

}: CategoryFilterProps) {
    const searchParams = useSearchParams();
    const [selectedValues, setSelectedValues] = useState(new Set<string>());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const options = [
        {
            id: "6",
            name: "토요일",
        },
        {
            id: "0",
            name: "일요일",
        },
    ];


    useEffect(() => {
        const selectedOptionsFromParams = new Set(searchParams.get(table)?.split(","));
        setSelectedValues(selectedOptionsFromParams);
    }, [searchParams, table]);

    useEffect(() => {
        onSelectedOptionsChange(Array.from(selectedValues));
    }, [selectedValues, onSelectedOptionsChange]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="lg" onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    <div className="font-bold text-lg">
                        {title}
                    </div>
                    {selectedValues.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 lg:hidden text-md"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 1 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 text-md"
                                    >
                                        양일
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option.id))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.id}
                                                className="rounded-sm px-1 text-md"
                                            >
                                                {option.name}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[120px] p-0" align="start">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            <ScrollArea className="h-auto">

                                {options.map((option) => {
                                    const isSelected = selectedValues.has(option.id);
                                    return (
                                        <CommandItem
                                            key={option.id}
                                            onSelect={() => {
                                                const newSelectedValues = new Set(selectedValues);
                                                if (isSelected) {
                                                    newSelectedValues.delete(option.id);
                                                } else {
                                                    newSelectedValues.add(option.id);
                                                }
                                                setSelectedValues(newSelectedValues);
                                            }}
                                        >
                                            <div className="flex w-full items-center gap-2 justify-between">

                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}
                                                >
                                                    <CheckIcon className={cn("h-4 w-4")} />
                                                </div>
                                                <div className="flex justify-between items-center w-full">
                                                    <p>{option.name}</p>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>

                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => setSelectedValues(new Set())}
                                        className="justify-center text-center"
                                    >
                                        필터 초기화
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}