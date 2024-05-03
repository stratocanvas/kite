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
import { createClient } from '@/utils/supabase/client'
import { useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient()

interface CharacterOption {
  id: string;
  name: string;
  thumbnail: string;
  sub: { name: string };
  count: number;
}



interface CharacterFilterProps {
  title?: string;
  table?: string;
  id?: string;
  sub?: string;
  subFromNested?: boolean;
  count?: string;
  params?: URLSearchParams;
  onSelectedOptionsChange: (selectedOptions: string[]) => void;
}

export function FilterWithThumb({
  title,
  table,
  id,
  sub,
  subFromNested,
  count,
  params,
  onSelectedOptionsChange,
}: CharacterFilterProps) {
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<CharacterOption[]>([]);
  const [selectedValues, setSelectedValues] = useState(new Set<string>());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);


  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from(table)
        .select(`${id}, name, ${subFromNested ? `${sub}(name)` : sub}, thumbnail, ${count}(count)`, { count: "estimated" });
      if (error) console.error(`Error fetching data from ${table}`, error);
      else {
        setOptions(data.map(item => ({
          id: item[id],
          name: item.name,
          sub: subFromNested ? item[sub]?.name : item[sub],
          thumbnail: item.thumbnail,
          count: item[count][0].count // Correctly accessing the count from the nested structure
        })));
        setIsDataFetched(true);
      }
    };

    if (!isDataFetched && (isPopoverOpen || params)) {
      fetchOptions();
  }
  }, [isPopoverOpen, isDataFetched, table, id, sub, count, subFromNested, params]);

  useEffect(() => {
    const selectedOptionsFromParams = new Set(searchParams.get(table)?.split(",").map(Number));
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
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 text-md"
                  >
                    {selectedValues.size}개 항목
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
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`${title} 검색...`} />
          <CommandList>
            <CommandEmpty>검색된 {title} 없음</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">

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

                        <Avatar>
                          <AvatarImage src={option.thumbnail} />
                          <AvatarFallback>{option.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col">
                            <p>{option.name}</p>
                            <p className="text-sm text-muted-foreground">{option.sub}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          {option.count > 0 && (
                            <p>{option.count}</p>
                          )}
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