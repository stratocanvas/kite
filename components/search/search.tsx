"use client"

import { FilterWithThumb } from "./filterwiththumb";
import { Filter } from "./filter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { FilterLight } from "./filterlight";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";

export function SearchBar() {
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [selectedDOW, setSelectedDOW] = useState<string[]>([]);
    const [boothName, setBoothName] = useState<string>("");
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    function handleSearch() {
        const params = new URLSearchParams(searchParams);
        if (selectedCharacters.length > 0) {
            params.set('character', selectedCharacters.join(','));
        }
        if (selectedCategories.length > 0) {
            params.set('category', selectedCategories.join(','));
        }
        if (selectedGenres.length > 0) {
            params.set('genre', selectedGenres.join(','));
        }
        if (selectedAuthors.length > 0) {
            params.set('author', selectedAuthors.join(','));
        }
        if (selectedDOW.length > 0) {
            params.set('dow', selectedDOW.join(','));
        }
        if (boothName.length > 0) {
            params.set('name', boothName);
        }
        replace(`/booth?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-2 w-full md:w-auto max-w-full mx-8 justify-center">
            <div className="flex flex-row gap-2">
                <Input placeholder="부스 이름 검색" className="text-[16px]" id="name" onChange={(e) => setBoothName(e.target.value)} />
                <Button type="submit" size="default" className="w-auto" onClick={handleSearch}>
                    <Search />
                </Button>
            </div>
            <ScrollArea className="whitespace-nowrap rounded-md">
                <div className="flex flex-row gap-2">
                    <FilterWithThumb
                        title="캐릭터"
                        table="character"
                        id="character_id"
                        sub="genre"
                        count="p_option"
                        subFromNested={true}
                        onSelectedOptionsChange={setSelectedCharacters}
                    />
                    <Filter
                        title="굿즈 종류"
                        table="category"
                        id="category_id"
                        count="product"
                        onSelectedOptionsChange={setSelectedCategories}
                    />
                    <Filter
                        title="장르"
                        table="genre"
                        id="genre_id"
                        count="booth"
                        onSelectedOptionsChange={setSelectedGenres}
                    />
                    <FilterWithThumb
                        title="작가"
                        table="author"
                        id="author_id"
                        sub="sns_x"
                        count="booth"
                        subFromNested={false}
                        onSelectedOptionsChange={setSelectedAuthors}
                    />
                    <FilterLight
                        title="요일"
                        table="dow"
                        onSelectedOptionsChange={setSelectedDOW}
                    />
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}

export function SearchBarSmall(params: typeof searchParams) {
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [selectedDOW, setSelectedDOW] = useState<string[]>([]);
    const [boothName, setBoothName] = useState<string>("");
    const [searchMode, setSearchMode] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const parameters = params
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    function handleSearch() {
        const params = new URLSearchParams(searchParams);
        if (selectedCharacters.length > 0) {
            params.set('character', selectedCharacters.join(','));
        } else {
            params.delete('character');
        }
        if (selectedCategories.length > 0) {
            params.set('category', selectedCategories.join(','));
        } else {
            params.delete('category');
        }
        if (selectedGenres.length > 0) {
            params.set('genre', selectedGenres.join(','));
        } else {
            params.delete('genre');
        }
        if (selectedAuthors.length > 0) {
            params.set('author', selectedAuthors.join(','));
        } else {
            params.delete('author');
        }
        if (selectedDOW.length > 0) {
            params.set('dow', selectedDOW.join(','));
        } else {
            params.delete('dow'); // 변경된 부분
        }
        if (boothName) {
            params.set('name', boothName);
        } else {
            params.delete('name');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    useEffect(() => {
        const params = searchParams;
        const characterParams = params.get('character')?.split(',') || [];
        const categoryParams = params.get('category')?.split(',') || [];
        const genreParams = params.get('genre')?.split(',') || [];
        const authorParams = params.get('author')?.split(',') || [];
        const dowParams = params.get('dow')?.split(',') || [];
        const nameParams = params.get('name') || "";
        console.log(nameParams);
        setSelectedCharacters(characterParams);
        setSelectedCategories(categoryParams);
        setSelectedGenres(genreParams);
        setSelectedAuthors(authorParams);
        setSelectedDOW(dowParams.map(Number));
        setBoothName(nameParams);
        setSearchInput(nameParams);
    }, []);

    function setQuery(name: string) {
        setBoothName(name);
    }

    const delayedSearch = useCallback(
        debounce((q) => setQuery(q), 500),
        []
    )

    const handleChange = (e) => {
        delayedSearch(e.target.value);
    }

    useEffect(() => {
        handleSearch();
    }, [selectedCharacters, selectedCategories, selectedGenres, selectedAuthors, selectedDOW, boothName]);

    return (
        <div className="flex gap-2 w-full justify-center w-full md:w-auto mx-8">
            <Button className={`md:hidden ${searchMode && "rounded-r-none"}`} type="submit" variant="secondary" size="sm" onClick={() => setSearchMode(!searchMode)}>
                <Search className="w-4 h-4" />
            </Button>
            {searchMode &&
                <Input
                    placeholder="부스 이름 검색"
                    className="text-[16px] h-full md:hidden -ml-3 rounded-l-none h-9 bg-muted"
                    id="name"
                    value={searchInput}
                    autoFocus={true}
                    onChange={(e) => { handleChange(e); setSearchInput(e.target.value) }} />
            }
            <div className="hidden md:flex gap-2 items-center bg-muted pl-3 rounded-md">
                <Search className="h-4 w-4" />
                <Input
                    placeholder="부스 이름 검색"
                    className="text-[16px] h-9 bg-muted"
                    id="name"
                    value={searchInput}
                    onChange={(e) => { handleChange(e); setSearchInput(e.target.value) }} />
            </div>
            <ScrollArea className="whitespace-nowrap rounded-md">
                <div className="flex gap-2">
                    <FilterWithThumb
                        params={parameters}
                        title="캐릭터"
                        table="character"
                        id="character_id"
                        sub="genre"
                        count="p_option"
                        subFromNested={true}
                        onSelectedOptionsChange={setSelectedCharacters}
                    />
                    <Filter
                        params={parameters}
                        title="굿즈 종류"
                        table="category"
                        id="category_id"
                        count="product"
                        onSelectedOptionsChange={setSelectedCategories}
                    />
                    <Filter
                        params={parameters}
                        title="장르"
                        table="genre"
                        id="genre_id"
                        count="booth"
                        onSelectedOptionsChange={setSelectedGenres}
                    />
                    <FilterWithThumb
                        params={parameters}
                        title="작가"
                        table="author"
                        id="author_id"
                        sub="sns_x"
                        count="booth"
                        subFromNested={false}
                        onSelectedOptionsChange={setSelectedAuthors}
                    />
                    <FilterLight
                        title="요일"
                        table="dow"
                        onSelectedOptionsChange={setSelectedDOW}
                    />
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}