"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, X, Check, ChevronsUpDown, CirclePlus, Pencil, Trash, ArrowRight, ArrowDown, CircleAlert, Circle, Dot, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm, useFormState } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { fetchEvents } from "./fetch"
import { useEffect, useState, useLayoutEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import * as React from "react"
import { useMediaQuery } from "react-responsive"
import { format, getDate, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RegisterAuthor, RegisterCategory } from "./submit"
import { Checkbox } from "@/components/ui/checkbox"
import FileUpload from "@/components/ui/file-upload"
import { SubmitBooth } from "./submit"
import Tiptap from "@/components/tiptap-editor"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CommandSeparator } from "cmdk"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { useRouter, redirect } from 'next/navigation';
import Vibrant from "node-vibrant"
import { v4 as uuidv4 } from "uuid";
import { GetUser } from "@/app/fetch"
import { useToast } from "@/components/ui/use-toast"
import { UserStateContext } from "@/providers"
import { fetchTwitterUser } from "./fetch"
import imageCompression from 'browser-image-compression';
import { RegisterTwitterAuthor } from "./submit";

const supabase = createClient()

const contentSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        type: z.string(),
        attrs: z.record(z.any()).optional(),
        content: z.array(contentSchema).optional(),
        text: z.string().optional(),
        marks: z.array(z.object({ type: z.string().optional() })).optional(),
    }).optional()
);

const formSchema = z.object({
    event: z.number(),
    name: z.string().min(1, { message: "부스 이름을 입력해 주세요" }),
    dates: z.array(z.date()),
    locations: z.array(z.string()).optional(),
    authors: z.array(z.number()).optional(),
    thumbnail: z.string().optional(),
    boothinfo: z.object({
        type: z.string().optional().nullable(),
        content: z.array(contentSchema).optional().nullable(),
    }).optional().nullable(),
    products: z.array(z.object({
        category: z.number().optional(),
        name: z.string().min(1, { message: "굿즈 이름을 입력해 주세요" }),
        authors: z.array(z.number()).optional().nullable(),
        options: z.array(z.object({
            name: z.string().min(1, { message: "옵션 이름을 입력해 주세요" }),
            price: z.number().min(0, { message: "가격을 입력해 주세요" }),
            character: z.number().optional().nullable(),
            thumbnail: z.string().optional().nullable(),
        })).optional().nullable()
    })).optional().nullable(),
    preorder: z.array(z.object({
        title: z.string().min(1, { message: "폼 제목을 입력해 주세요" }),
        type: z.string().min(1, { message: "선입금/통판/수요조사 중 하나를 선택해 주세요" }),
        date: z.array(z.date()).min(1, { message: "폼 기간을 설정해 주세요" }),
        always: z.boolean().optional(),
        url: z.string().url().optional()
    })).optional().nullable(),
    genre: z.array(z.number()).optional().nullable()
});

const authorFormSchema = z.object({
    authorname: z.string().min(1, { message: "부스 이름을 입력해 주세요" }),
    authorprofile: z.string().optional(),
    authorsns_x: z.string().min(1, { message: "SNS 아이디를 입력해 주세요" }),
});

export default function RequestForm() {
    const { toast } = useToast()

    const router = useRouter();
    const { userData } = React.useContext(UserStateContext);

    React.useEffect(() => {
        if (!userData) {
            const path = window.location.pathname + window.location.search;
            router.push(`/auth?next=${encodeURIComponent(path)}`);
        }
    }, [userData]);

    const isDesktop = useMediaQuery({ minWidth: 768 })

    //행사 선택
    const [eventFetched, setEventFetched] = useState(false);
    const [eventOptions, setEventOptions] = useState<{ value: number, label: string, location: string, start_date: Date, end_date: Date }[]>([]);
    const [eventOpen, setEventOpen] = useState(false);
    const [event, setEvent] = useState(false)

    //작가 선택
    const [authorFetched, setAuthorFetched] = useState(false);
    const [authorOptions, setAuthorOptions] = useState<{ value: string, label: string, thumbnail: string, sns_x: string }[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<{ value: string, label: string, thumbnail: string, sns_x: string }[]>([]);
    const [authorOpen, setAuthorOpen] = useState(false);
    const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
    const [author, setAuthor] = useState(false)

    //캐릭터 선택
    const [characterFetched, setCharacterFetched] = useState(false);
    const [characterOptions, setCharacterOptions] = useState<{ value: string, label: string, thumbnail: string, genre: string }[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<{ value: string, label: string, thumbnail: string, genre: string }[]>([]);
    const [characterOpen, setCharacterOpen] = useState<boolean[]>([]);
    const [character, setCharacter] = useState(false)
    const [characterDialogOpen, setCharacterDialogOpen] = useState(false);

    //장르
    const [genreFetched, setGenreFetched] = useState(false);
    const [genreOptions, setGenreOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<{ value: string, label: string }>();
    const [genreOpen, setGenreOpen] = useState(false);
    const [genre, setGenre] = useState(false)
    const [genreDialogOpen, setGenreDialogOpen] = useState(false);



    const [name, setName] = useState(false)
    const [date, setDate] = useState(false)
    const [location, setLocation] = useState(false)
    const [locationUnknown, setLocationUnknown] = useState(false)
    const [inputValue, setInputValue] = useState('');

    const [categoryOptions, setCategoryOptions] = useState<{ value: number, label: string }[]>([]);
    const [categoryFetched, setCategoryFetched] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState<boolean[]>([]);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    const [productAuthorOpen, setProductAuthorOpen] = useState<boolean[]>([]);
    const [selectedProductAuthors, setSelectedProductAuthors] = useState<{ value: string, label: string, thumbnail: string, sns_x: string }[]>([]);
    const [preorderType, setPreorderType] = useState('')
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [twitterProfile, setTwitterProfile] = useState(false)
    //twitter user fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const data = await fetchTwitterUser()
            twitterAuthorForm.reset(
                {
                    authorname: data?.name,
                    authorsns_x: data?.preferred_username,
                    authorprofile: data?.picture,
                }
            );
            setTwitterProfile(true)
        };

        if (authorDialogOpen && !twitterProfile && userData.providers.includes('twitter')) {
            fetchOptions();
        }
    }, [authorDialogOpen]);



    //이벤트 fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from("event")
                .select('event_id, name, location, start_date, end_date');
            if (error) console.error('Error fetching data', error);
            else {
                setEventOptions(data.map(item => ({
                    value: item.event_id,
                    label: item.name,
                    location: item.location,
                    start_date: item.start_date,
                    end_date: item.end_date
                })));
                setEventFetched(true);
            }
        };

        if (eventOpen && !eventFetched) {
            fetchOptions();
        }
    }, [eventOpen, eventFetched]);

    //굿즈 카테고리 fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from("category")
                .select('category_id, name');
            if (error) console.error('Error fetching data', error);
            else {
                setCategoryOptions(data.map(item => ({
                    value: item.category_id,
                    label: item.name
                })));
                setCategoryFetched(true);
            }
        };

        if (categoryOpen && !categoryFetched) {
            fetchOptions();
        }
    }, [categoryOpen, categoryFetched]);

    //작가 fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from("author")
                .select('author_id, name, thumbnail, sns_x');
            if (error) console.error('Error fetching data', error);
            else {
                setAuthorOptions(data.map(item => ({
                    value: item.author_id,
                    label: item.name,
                    thumbnail: item.thumbnail,
                    sns_x: item.sns_x
                })));
                setAuthorFetched(true);
            }
        };

        if ((authorOpen || (productAuthorOpen.length > 0 && productAuthorOpen.some(open => open))) && !authorFetched) {
            fetchOptions();
        }
    }, [authorOpen, authorFetched, productAuthorOpen]);

    //캐릭터 fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from("character")
                .select('character_id, name, thumbnail, genre(name)');
            if (error) console.error('Error fetching data', error);
            else {
                setCharacterOptions(data.map(item => ({
                    value: item.character_id,
                    label: item.name,
                    thumbnail: item.thumbnail,
                    genre: item.genre?.name || ''
                })));

                setCharacterFetched(true);
            }
        };

        if (characterOpen && !characterFetched) {
            fetchOptions();
        }
    }, [characterOpen, characterFetched]);

    //장르 fetch
    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from("genre")
                .select('genre_id, name');
            if (error) console.error('Error fetching data', error);
            else {
                setGenreOptions(data.map(item => ({
                    value: item.genre_id,
                    label: item.name,
                })));
                setGenreFetched(true);
            }
        };

        if ((selectedCharacters || genreOpen) && !genreFetched) {
            fetchOptions();
        }
    }, [selectedCharacters, genreOpen, genreFetched]);


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            event: undefined,
            name: "",
            dates: null,
            locations: [],
            authors: [],
            thumbnail: "",
            boothinfo: null,
            products: [],
            preorder: [],
            genre: []
        },
        mode: "all"
    });

    const authorForm = useForm({
        resolver: zodResolver(authorFormSchema),
        defaultValues: {
            authorname: "",
            authorsns_x: "",
            authorprofile: "",
        },
        mode: "all"
    });

    const twitterAuthorForm = useForm({
        resolver: zodResolver(authorFormSchema),
        defaultValues: {
            authorname: "",
            authorsns_x: "",
            authorprofile: "",
        },
        mode: "all"
    });



    const { isSubmitting, isSubmitted, isSubmitSuccessful, isValid } = useFormState(form);

    async function onSubmitAuthor(authorFormValues: z.infer<typeof authorFormSchema>) {
        const { authorname, authorsns_x, authorprofile } = authorFormValues;

        try {
            let profileImageUrl = null;

            if (authorprofile) {
                // 1. browser-image-compression으로 webp로 변환
                const uuid = uuidv4();
                const fileName = `${uuid}.webp`;
                // 2. 클라이언트단에서 supabase로 업로드
                const imageFile = await fetch(authorprofile).then(r => r.blob());
                const { data, error } = await supabase.storage
                    .from("author")
                    .upload(`thumbnail/${fileName}`, imageFile);
                if (error) {
                    throw error;
                }

                // 3. 업로드한 사진의 publicurl 획득 
                const { data: urlData } = await supabase.storage
                    .from("author")
                    .getPublicUrl(data.path);

                profileImageUrl = urlData.publicUrl;
            }

            // 4. publicurl과 나머지 정보를 함께 registerAuthor로 보냄
            const data = await RegisterAuthor({ name: authorname, sns_x: authorsns_x, thumbnail: profileImageUrl });
            const { author_id, name, sns_x, thumbnail } = data;

            // setSelectedAuthors 관련 작업은 반드시 실행되어야 함
            setSelectedAuthors([...selectedAuthors, { value: author_id, label: name, sns_x: sns_x, thumbnail: thumbnail }]);
            form.setValue("authors", [...(form.getValues("authors") || []), author_id]);
            setAuthorFetched(false);
            setAuthorDialogOpen(false);

            toast({ title: "작가 등록 완료!" });
        } catch (error) {
            toast({ variant: "destructive", title: "작가 등록에 실패했어요.", description: error.message });
        }
    }

    async function onSubmitTwitterAuthor(twitterAuthorFormValues: z.infer<typeof authorFormSchema>) {
        console.log("START");
        const { authorname, authorsns_x, authorprofile } = twitterAuthorFormValues;

        try {
            let profileImageUrl = null;

            if (authorprofile) {
                // 1. browser-image-compression으로 webp로 변환
                const uuid = uuidv4();
                const fileName = `${uuid}.webp`;

                const imageFile = await fetch(authorprofile).then(r => r.blob());

                const compressedFile = await imageCompression(imageFile, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    initialQuality: 0.8,
                    fileType: 'webp'
                });

                // 2. 클라이언트단에서 supabase로 업로드
                const { data, error } = await supabase.storage
                    .from("author")
                    .upload(`thumbnail/${fileName}`, compressedFile);

                if (error) {
                    throw error;
                }

                // 3. 업로드한 사진의 publicurl 획득 
                const { data: urlData } = await supabase.storage
                    .from("author")
                    .getPublicUrl(data.path);

                profileImageUrl = urlData.publicUrl;
            }

            // 4. publicurl과 나머지 정보를 함께 registerAuthor로 보냄
            const data = await RegisterTwitterAuthor({ name: authorname, sns_x: authorsns_x, thumbnail: profileImageUrl });
            const { author_id, name, sns_x, thumbnail } = data;

            // setSelectedAuthors 관련 작업은 반드시 실행되어야 함
            setSelectedAuthors([...selectedAuthors, { value: author_id, label: name, sns_x: sns_x, thumbnail: thumbnail }]);
            form.setValue("authors", [...(form.getValues("authors") || []), author_id]);
            setAuthorFetched(false);
            setAuthorDialogOpen(false);

            toast({ title: "작가 등록 완료!" });
        } catch (error) {
            toast({ variant: "destructive", title: "작가 등록에 실패했어요.", description: error.message });
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // 제출되는 이미지들 처리
            if (values.thumbnail) {
                // 색상 추출 (darkmuted)
                const darkMutedHex = await extractColor(values.thumbnail, 'thumbnail');
                // 너비, 높이 추출
                const thumbnailDimensions = await getImageDimensions(values.thumbnail);
                // 파일명 변경 
                const thumbnailUuid = uuidv4();
                const thumbnailFileName = `${thumbnailUuid}-c(${darkMutedHex})-w(${thumbnailDimensions.width})-h(${thumbnailDimensions.height}).webp`;
                // 이미지 파일 가져오기
                const thumbnailFile = await fetch(values.thumbnail).then(r => r.blob());
                const { data, error } = await supabase.storage
                    .from("booth")
                    .upload(`thumbnails/${thumbnailFileName}`, thumbnailFile, {
                        contentType: "image/webp",
                    });

                if (error) {
                    throw error;
                }

                const publicUrlData = await supabase.storage
                    .from("booth")
                    .getPublicUrl(data.path);

                values.thumbnail = publicUrlData.data.publicUrl;
            }
            if (values.boothinfo?.content) {
                for (const item of values.boothinfo.content) {
                    if (item.type === "image") {
                        // 색상 추출 (muted)
                        const mutedHex = await extractColor(item.attrs?.src, 'article');

                        // 너비, 높이 추출
                        const imageDimensions = await getImageDimensions(item.attrs?.src);

                        // 파일명 변경
                        const imageUuid = uuidv4();
                        const imageFileName = `${imageUuid}-c(${mutedHex})-w(${imageDimensions.width})-h(${imageDimensions.height}).webp`;

                        // 이미지 파일 가져오기
                        const imageFile = await fetch(item.attrs?.src).then(r => r.blob());

                        // Supabase에 업로드  
                        const { data, error } = await supabase.storage
                            .from("booth")
                            .upload(`article/${imageFileName}`, imageFile, {
                                contentType: "image/webp",
                            });

                        if (error) {
                            throw error;
                        }

                        const publicUrlData = await supabase.storage
                            .from("booth")
                            .getPublicUrl(data.path);

                        item.attrs.src = publicUrlData.data.publicUrl;
                    }
                }
            }

            if (values.products) {
                for (const product of values.products) {
                    if (product.options) {
                        for (const option of product.options) {
                            if (option.thumbnail) {
                                // 색상 추출 (muted)
                                const mutedHex = await extractColor(option.thumbnail, 'option');

                                // 너비, 높이 추출
                                const optionDimensions = await getImageDimensions(option.thumbnail);

                                // 파일명 변경
                                const optionUuid = uuidv4();
                                const optionFileName = `${optionUuid}-c(${mutedHex})-w(${optionDimensions.width})-h(${optionDimensions.height}).webp`;

                                // 이미지 파일 가져오기
                                const optionFile = await fetch(option.thumbnail).then(r => r.blob());

                                // Supabase에 업로드
                                const { data, error } = await supabase.storage
                                    .from("product")
                                    .upload(`option/${optionFileName}`, optionFile, {
                                        contentType: "image/webp",
                                    });

                                if (error) {
                                    throw error;
                                }

                                const publicUrlData = await supabase.storage
                                    .from("product")
                                    .getPublicUrl(data.path);

                                option.thumbnail = publicUrlData.data.publicUrl;
                            }
                        }
                    }
                }
            }
            const result = await SubmitBooth(values);
            toast({
                title: "부스 등록 성공!",
                description: "등록된 부스 페이지로 이동합니다.",
            })
            router.push(`/booth/${result.booth_id}`);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "부스 등록에 실패했어요.",
                description: error.message,
            })
            // TODO: 오류 처리 로직 추가
        }
    }
    async function getImageDimensions(imageUrl: string) {
        return new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    }
    async function extractColor(imageUrl: string, type: 'thumbnail' | 'article' | 'option') {
        try {
            // 이미지 URL을 사용하여 Vibrant 객체 생성
            const vibrant = new Vibrant(imageUrl);

            // 색상 팔레트 추출
            const palette = await vibrant.getPalette();

            let color: string | undefined;

            if (type === 'thumbnail') {
                // thumbnail인 경우 DarkMuted 색상 가져오기
                color = palette.DarkMuted?.hex;
            } else {
                // boothinfo나 option인 경우 Muted 색상 가져오기
                color = palette.Muted?.hex;
            }

            return color?.replace('#', '') || '797979'; // #을 제거하고 색상이 없는 경우 기본값으로 회색 사용
        } catch (error) {
            return '797979'; // 오류 발생 시 기본값으로 회색 사용
        }
    }
    const selectedEvent = eventOptions.find((event) => event.value === form.watch('event'));
    const dateOptions = selectedEvent
        ? eachDayOfInterval({
            start: selectedEvent.start_date,
            end: selectedEvent.end_date,
        }).map((date) => ({
            value: date.toISOString(),
            label: format(date, 'yyyy-MM-dd'),
        }))
        : [];

    useEffect(() => {
        const allCharacterGenres = form.getValues('products')?.flatMap((product) =>
            product.options?.flatMap((option) =>
                option.characters?.map((characterId) => {
                    const character = characterOptions.find((c) => c.value === characterId);
                    return character?.genre;
                })
            )
        ).filter((genre): genre is string => !!genre);

        const uniqueGenres = [...new Set(allCharacterGenres)];
        const genreIds = uniqueGenres.map((genre) => genreOptions.find((g) => g.label === genre)?.value).filter((id): id is string => !!id);
        form.setValue('genre', [...new Set([...(form.getValues('genre') || []), ...genreIds])]);
    }, [selectedCharacters]);

    return (
        <Card className="sm:w-full lg:w-[800px] mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle>부스 직접 등록</CardTitle>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                    <div className="w-full flex gap-2">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">기본 정보</TabsTrigger>
                            <TabsTrigger value="info">인포</TabsTrigger>
                            <TabsTrigger value="goods">굿즈</TabsTrigger>
                            <TabsTrigger value="etc">기타</TabsTrigger>
                        </TabsList>
                    </div>

                    <Form {...form}>
                        <form key={1} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
                            <TabsContent value="basic" asChild>
                                <>
                                    {location && (
                                        <FormField
                                            control={form.control}
                                            name="authors"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-lg">참여 작가</FormLabel>
                                                    <Card className="w-full md:w-[400px]">
                                                        <CardHeader>
                                                            <div className="flex items-center gap-2">
                                                                <Popover open={authorOpen} onOpenChange={() => setAuthorOpen(!authorOpen)}>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button
                                                                                variant="outline"
                                                                                role="combobox"
                                                                                className={cn(
                                                                                    "w-full md:w-[400px] justify-between",
                                                                                    !field.value && "text-muted-foreground"
                                                                                )}
                                                                                onClick={() => setAuthorOpen(true)}
                                                                            >
                                                                                작가 추가

                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-full md:w-[350px] p-0">
                                                                        <Command>
                                                                            <CommandInput placeholder="작가 검색..." />
                                                                            <CommandList>
                                                                                <CommandEmpty>
                                                                                    <Dialog open={authorDialogOpen} onOpenChange={() => setAuthorDialogOpen(!authorDialogOpen)}>
                                                                                        <div className="flex flex-col gap-2 items-center">
                                                                                            검색된 작가 없음
                                                                                            <DialogTrigger asChild>
                                                                                                <Button variant="secondary" >
                                                                                                    작가 등록
                                                                                                </Button>
                                                                                            </DialogTrigger>
                                                                                        </div>
                                                                                        <DialogContent className="sm:max-w-[425px]">
                                                                                            <DialogHeader>
                                                                                                <DialogTitle>작가 등록</DialogTitle>
                                                                                            </DialogHeader>

                                                                                            {userData?.providers.includes("twitter") && (
                                                                                                <>
                                                                                                    <form key={3} onSubmit={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        e.stopPropagation();
                                                                                                        twitterAuthorForm.handleSubmit(onSubmitTwitterAuthor)(e);
                                                                                                    }}>
                                                                                                        <FormLabel>내 X(Twitter) 프로필</FormLabel>
                                                                                                        <div className="flex justify-between mt-2 items-center">
                                                                                                            <div className="flex flex-row gap-3 items-center">
                                                                                                                <FormField
                                                                                                                    control={twitterAuthorForm.control}
                                                                                                                    name="authorprofile"
                                                                                                                    render={({ field }) => (
                                                                                                                        <Avatar>
                                                                                                                            <AvatarImage src={field.value} />

                                                                                                                        </Avatar>
                                                                                                                    )}
                                                                                                                />
                                                                                                                <div>
                                                                                                                    <FormField
                                                                                                                        control={twitterAuthorForm.control}
                                                                                                                        name="authorname"
                                                                                                                        render={({ field }) => (
                                                                                                                            <p>{field.value}</p>
                                                                                                                        )}
                                                                                                                    />
                                                                                                                    <FormField
                                                                                                                        control={twitterAuthorForm.control}
                                                                                                                        name="authorsns_x"
                                                                                                                        render={({ field }) => (
                                                                                                                            <p className="text-sm text-muted-foreground">@{field.value}</p>
                                                                                                                        )}
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <Button type="submit">
                                                                                                                등록
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    </form>
                                                                                                    <Separator />
                                                                                                </>
                                                                                            )}

                                                                                            <form key={2} onSubmit={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.stopPropagation();
                                                                                                authorForm.handleSubmit(onSubmitAuthor)(e);
                                                                                            }}>
                                                                                                <div className="flex flex-col gap-6 py-4 justify-start">

                                                                                                    <FormField
                                                                                                        control={authorForm.control}
                                                                                                        name="authorprofile"
                                                                                                        render={({ field }) => (
                                                                                                            <FormItem className="flex flex-col">
                                                                                                                <FormLabel>프로필 사진</FormLabel>
                                                                                                                <FormControl>
                                                                                                                    <div className="w-20">
                                                                                                                        <FileUpload
                                                                                                                            name="profileimage"
                                                                                                                            onChange={(file) => {
                                                                                                                                authorForm.setValue("authorprofile", file);
                                                                                                                                setProfileImagePreview(file);
                                                                                                                            }}
                                                                                                                            ratio={1}
                                                                                                                            maxSize={10000000}
                                                                                                                            maxFiles={1}
                                                                                                                            value={profileImagePreview}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </FormControl>
                                                                                                                <FormMessage />
                                                                                                            </FormItem>
                                                                                                        )}
                                                                                                    />
                                                                                                    <FormField
                                                                                                        control={authorForm.control}
                                                                                                        name="authorname"
                                                                                                        render={({ field }) => (
                                                                                                            <FormItem className="flex flex-col">
                                                                                                                <FormLabel>이름</FormLabel>
                                                                                                                <FormControl>
                                                                                                                    <Input {...field}
                                                                                                                        required
                                                                                                                        autoComplete="off"
                                                                                                                        placeholder="작가 활동명 입력"
                                                                                                                        className="w-full"
                                                                                                                        onChange={(e) => { field.onChange(e.target.value) }}
                                                                                                                    />
                                                                                                                </FormControl>
                                                                                                                <FormMessage />
                                                                                                            </FormItem>
                                                                                                        )}
                                                                                                    />
                                                                                                    <FormField
                                                                                                        control={authorForm.control}
                                                                                                        name="authorsns_x"
                                                                                                        render={({ field }) => (
                                                                                                            <FormItem className="flex flex-col">
                                                                                                                <FormLabel>SNS 아이디</FormLabel>
                                                                                                                <FormControl>
                                                                                                                    <Input {...field}
                                                                                                                        required
                                                                                                                        autoComplete="off"
                                                                                                                        placeholder="X(Twitter) 아이디 입력"
                                                                                                                        className="w-full"
                                                                                                                        onChange={(e) => { field.onChange(e.target.value) }}
                                                                                                                    />
                                                                                                                </FormControl>
                                                                                                                <FormMessage />
                                                                                                            </FormItem>
                                                                                                        )}
                                                                                                    />
                                                                                                </div>
                                                                                                <DialogFooter>
                                                                                                    <Button type="submit">등록
                                                                                                    </Button>
                                                                                                </DialogFooter>
                                                                                            </form>
                                                                                        </DialogContent>
                                                                                    </Dialog>
                                                                                </CommandEmpty>
                                                                                <CommandGroup>
                                                                                    {authorOptions.map((author) => (
                                                                                        <CommandItem
                                                                                            value={author.value}
                                                                                            key={author.value}
                                                                                            onSelect={() => {
                                                                                                const isSelected = field.value?.includes(author.value);
                                                                                                if (isSelected) {
                                                                                                    field.onChange(field.value?.filter((value) => value !== author.value));
                                                                                                    setSelectedAuthors(selectedAuthors.filter((selectedAuthor) => selectedAuthor.value !== author.value));
                                                                                                } else {
                                                                                                    field.onChange([...(field.value || []), author.value]);
                                                                                                    setAuthor(true);
                                                                                                    setSelectedAuthors([...selectedAuthors, author]);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <Check
                                                                                                className={cn(
                                                                                                    "mr-2 h-4 w-4",
                                                                                                    field.value?.includes(author.value)
                                                                                                        ? "opacity-100"
                                                                                                        : "opacity-0"
                                                                                                )}
                                                                                            />
                                                                                            <div className="flex flex-row gap-2">
                                                                                                <Avatar>
                                                                                                    <AvatarImage src={author.thumbnail} />
                                                                                                    <AvatarFallback>
                                                                                                        <p>{author?.label[0]}</p>
                                                                                                    </AvatarFallback>
                                                                                                </Avatar>
                                                                                                <div className="flex flex-col">
                                                                                                    <p>{author?.label}</p>
                                                                                                    <p className="text-muted-foreground">{author?.sns_x}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {selectedAuthors.map((author) => (
                                                                <div key={author?.value} className="my-2">
                                                                    <div className="flex flex-row gap-2 items-center justify-between">
                                                                        <div className="flex flex-row gap-2 items-center">
                                                                            <Avatar>
                                                                                <AvatarImage src={author?.thumbnail} />
                                                                                <AvatarFallback>
                                                                                    <p>{author?.label[0]}</p>
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex flex-col">
                                                                                <p>{author?.label}</p>
                                                                                <p className="text-muted-foreground">{author?.sns_x}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={() => {
                                                                                field.onChange(field.value?.filter((value) => value !== author.value));
                                                                                setSelectedAuthors(selectedAuthors.filter((selectedAuthor) => selectedAuthor.value !== author.value));
                                                                            }}
                                                                        >
                                                                            삭제
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </CardContent>
                                                    </Card>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {date && (
                                        <FormField
                                            control={form.control}
                                            name="locations"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-lg">부스 위치</FormLabel>
                                                    <Card className="p-0 flex flex-row h-10 gap-2 items-center w-full md:w-[400px]">
                                                        <div className="w-auto flex mt-2">
                                                            {(field.value || []).map((location, index) => (
                                                                <Button
                                                                    key={index}
                                                                    type="button"
                                                                    size="sm"
                                                                    className={cn("h-6 w-auto mb-2 ml-2", badgeVariants({ variant: "secondary" }))}
                                                                    onClick={() => {
                                                                        field.onChange((field.value || []).filter((_, i) => i !== index));
                                                                    }}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <X className="w-4 h-4 mr-1 text-muted-foreground" />
                                                                        {location}
                                                                    </div>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <FormControl>
                                                            {!locationUnknown ? (
                                                                <Input
                                                                    className="border-none m-0 h-8"
                                                                    placeholder="A00..."
                                                                    value={inputValue}
                                                                    autoComplete="off"

                                                                    onChange={(e) => setInputValue(e.target.value)}

                                                                />
                                                            ) : (
                                                                <Input
                                                                    className="border-none m-0 h-8"
                                                                    placeholder="A00..."
                                                                    value={inputValue}
                                                                    autoComplete="off"

                                                                    onChange={(e) => setInputValue(e.target.value)}
                                                                    disabled
                                                                />
                                                            )}
                                                        </FormControl>
                                                    </Card>
                                                    <div className="flex gap-2 mt-2">
                                                        {inputValue && !locationUnknown && Array.from({ length: 3 }, (_, i) => {
                                                            const baseNumber = Number.parseInt(inputValue.match(/\d+$/)?.[0] || "0", 10);
                                                            return baseNumber === 0 ? i + 1 : baseNumber + i;
                                                        }).map((number) => {
                                                            const location = `${inputValue.charAt(0).toUpperCase() + inputValue.slice(1).replace(/-/g, "").replace(/\s/g, "").replace(/\d+$/, "")}${number.toString().padStart(2, "0")}`;
                                                            // Check if the location is already in the field value to prevent duplicates
                                                            if ((field.value || []).includes(location)) {
                                                                return null; // Do not render the button if the location is already added
                                                            }
                                                            return (

                                                                <Button
                                                                    key={number}
                                                                    type="button"
                                                                    className={cn("h-8 w-auto", badgeVariants({ variant: "secondary" }))}
                                                                    onClick={() => {
                                                                        const newLocations = [...(field.value || []), location];
                                                                        field.onChange(newLocations);
                                                                        setLocation(true)
                                                                    }}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <Plus className="w-4 h-4 mr-1 text-muted-foreground" />
                                                                        {location}
                                                                    </div>
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                    {(field.value || []).length === 0 && (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox id="terms2" />
                                                            <Label
                                                                htmlFor="terms2"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                onClick={() => { setLocation(true); field.onChange([]); setLocationUnknown((prev) => !prev) }}
                                                            >
                                                                부스 위치가 정해지지 않았어요
                                                            </Label>
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {name && (
                                        <FormField
                                            control={form.control}
                                            name="dates"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-lg">참여 날짜</FormLabel>
                                                    <FormControl>
                                                        <ToggleGroup
                                                            className="justify-start"
                                                            variant="outline"
                                                            type="multiple"
                                                            value={(field.value || []).map((date) => date.toISOString())}
                                                            onValueChange={(values) => {
                                                                field.onChange(values.map((value) => new Date(value)));
                                                                setDate(true)
                                                            }}
                                                        >
                                                            {dateOptions.map((date) => (
                                                                <ToggleGroupItem key={date.value} value={date.value}>
                                                                    <div className="flex flex-col items-center">
                                                                        <div>{format(new Date(date.value), 'EEE', { locale: ko })}요일</div>
                                                                        <div className="text-xs text-muted-foreground">{date.label}</div>
                                                                    </div>
                                                                </ToggleGroupItem>
                                                            ))}
                                                        </ToggleGroup>
                                                    </FormControl>
                                                    <FormDescription>
                                                        모두 선택해 주세요
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {event && (
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-lg">부스 이름</FormLabel>
                                                    <FormControl>
                                                        <Input {...field}
                                                            required
                                                            autoComplete="off"

                                                            className="w-full md:w-[400px]"
                                                            onChange={(e) => { setName(true); field.onChange(e.target.value) }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="event"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-lg">행사</FormLabel>
                                                <Popover open={eventOpen} onOpenChange={() => setEventOpen(!eventOpen)}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full md:w-[400px] justify-between",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                                onClick={() => setEventOpen(true)}
                                                            >
                                                                {field.value
                                                                    ? eventOptions.find(
                                                                        (event) => event.value === field.value
                                                                    )?.label
                                                                    : "행사 선택"}

                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full md:w-[400px] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="행사 검색..." />
                                                            <CommandList>
                                                                <CommandEmpty>검색된 행사 없음</CommandEmpty>
                                                                <CommandGroup>
                                                                    {eventOptions.map((event) => (
                                                                        <CommandItem
                                                                            key={event.value}
                                                                            value={event.value}
                                                                            onSelect={() => {
                                                                                form.setValue("event", event.value);
                                                                                form.setValue("dates", []); // 날짜 초기화
                                                                                setEventOpen(false);
                                                                                setEvent(true);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    event.value === field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {event.label}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </>

                            </TabsContent>
                            <TabsContent value="info" asChild>
                                <>
                                    <FormField
                                        control={form.control}
                                        name="thumbnail"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-lg">현수막</FormLabel>
                                                <FormControl>
                                                    <FileUpload
                                                        name="thumbnail"
                                                        onChange={(file) => {
                                                            setThumbnail(file);
                                                            form.setValue("thumbnail", file);
                                                        }}
                                                        ratio={1}
                                                        maxSize={10000000}
                                                        maxFiles={1}
                                                        value={thumbnail}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="boothinfo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-lg">인포</FormLabel>
                                                <FormControl>
                                                    <Tiptap
                                                        initValue={field.value || null} // 추가
                                                        onChange={(jsonData) => {
                                                            field.onChange(jsonData);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </>
                            </TabsContent>
                            <TabsContent value="goods" asChild>

                                <>
                                    <FormField
                                        control={form.control}
                                        name="products"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="text-lg">굿즈</FormLabel>
                                                    <div className="flex gap-2">
                                                        {!editMode ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditMode(true)
                                                                }}
                                                            >

                                                                <div className="flex items-center gap-2">
                                                                    <Pencil className="w-4 h-4" />
                                                                    편집
                                                                </div>

                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => {
                                                                    setEditMode(false)
                                                                }}
                                                            >

                                                                <div className="flex items-center gap-2">
                                                                    <Check className="w-4 h-4" />
                                                                    확인
                                                                </div>

                                                            </Button>
                                                        )
                                                        }
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newProduct = {
                                                                    category: 0,
                                                                    name: "",
                                                                    authors: [],
                                                                    options: [
                                                                        {
                                                                            thumbnail: null,
                                                                            name: "",
                                                                            price: undefined,
                                                                            characters: [],
                                                                        },
                                                                    ],
                                                                };
                                                                field.onChange([...(field.value || []), newProduct]);

                                                                setCategoryOpen([...categoryOpen, false]);
                                                                setCharacterOpen([...characterOpen, false]);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="w-4 h-4" />
                                                                추가
                                                            </div>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Carousel className="w-full"
                                                        opts={{
                                                            align: 'start',
                                                            dragFree: true
                                                        }}
                                                        plugins={
                                                            []
                                                        }>
                                                        <CarouselContent className="mt-4 flex items-stretch">
                                                            {(field.value || []).map((product, index) => (
                                                                <CarouselItem key={index} className="basis-auto pl-4 h-full">
                                                                    <Card className="w-[300px] lg:w-[350px] h-full mx-auto">
                                                                        <CardContent className="flex flex-col gap-2 mt-4">
                                                                            {editMode &&
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    onClick={() => {
                                                                                        const newProducts = field.value.filter((_, i) => i !== index);
                                                                                        field.onChange(newProducts);

                                                                                        const newCategoryOpen = categoryOpen.filter((_, i) => i !== index);
                                                                                        setCategoryOpen(newCategoryOpen);

                                                                                        const newCharacterOpen = characterOpen.filter((_, i) => i < index * 100 || i >= (index + 1) * 100);
                                                                                        setCharacterOpen(newCharacterOpen);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Trash className="w-4 h-4" />
                                                                                        굿즈 삭제
                                                                                    </div>
                                                                                </Button>
                                                                            }
                                                                            <div>

                                                                                <Label htmlFor={`prodName-${index}`}>굿즈 이름</Label>
                                                                                <Input
                                                                                    id={`prodName-${index}`}
                                                                                    value={product.name}
                                                                                    autoComplete="off"

                                                                                    onChange={(e) => {
                                                                                        const newProducts = [...field.value];
                                                                                        newProducts[index] = {
                                                                                            ...newProducts[index],
                                                                                            name: e.target.value,
                                                                                        };
                                                                                        field.onChange(newProducts);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label htmlFor={`prodCategory-${index}`}>굿즈 종류</Label>
                                                                                <Popover
                                                                                    open={categoryOpen[index]}
                                                                                    onOpenChange={() => {
                                                                                        const newStates = [...categoryOpen];
                                                                                        newStates[index] = !newStates[index];
                                                                                        setCategoryOpen(newStates);
                                                                                    }}
                                                                                >
                                                                                    <PopoverTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            role="combobox"
                                                                                            className={cn(
                                                                                                "w-full justify-between",
                                                                                                !product.category && "text-muted-foreground"
                                                                                            )}
                                                                                            onClick={() => {
                                                                                                const newStates = [...categoryOpen];
                                                                                                newStates[index] = true;
                                                                                                setCategoryOpen(newStates);
                                                                                            }}
                                                                                        >
                                                                                            {product.category
                                                                                                ? categoryOptions.find(
                                                                                                    (category) => category.value === product.category
                                                                                                )?.label
                                                                                                : "카테고리 선택"}

                                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                        </Button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className="w-full p-0">
                                                                                        <Command>
                                                                                            <CommandInput placeholder="카테고리 검색..." />
                                                                                            <CommandList>
                                                                                                <CommandEmpty>
                                                                                                    <Dialog open={categoryDialogOpen} onOpenChange={() => setCategoryDialogOpen(!categoryDialogOpen)}>
                                                                                                        <div className="flex flex-col gap-2 items-center">
                                                                                                            검색된 카테고리 없음
                                                                                                            <DialogTrigger asChild>
                                                                                                                <Button variant="secondary" onClick={() => setCategoryDialogOpen(true)}>
                                                                                                                    카테고리 등록
                                                                                                                </Button>
                                                                                                            </DialogTrigger>
                                                                                                        </div>
                                                                                                        <DialogContent className="sm:max-w-[425px]">
                                                                                                            <DialogHeader>
                                                                                                                <DialogTitle>카테고리 등록</DialogTitle>
                                                                                                            </DialogHeader>
                                                                                                            <form onSubmit={(e) => {
                                                                                                                e.preventDefault();
                                                                                                                e.stopPropagation();
                                                                                                                const form = e.target as HTMLFormElement;
                                                                                                                const formData = new FormData(form);
                                                                                                                const name = formData.get('name') as string;
                                                                                                                RegisterCategory({ name })
                                                                                                                    .then((data) => {
                                                                                                                        const { category_id } = data;
                                                                                                                        const newProducts = [...field.value];
                                                                                                                        newProducts[index].category = category_id;
                                                                                                                        field.onChange(newProducts);
                                                                                                                        setCategoryFetched(false);
                                                                                                                        setCategoryDialogOpen(false);
                                                                                                                    })
                                                                                                                    .catch((error) => {
                                                                                                                        console.error('Failed to register author:', error);
                                                                                                                    });
                                                                                                            }}>
                                                                                                                <div className="flex flex-col gap-6 py-4 justify-start">
                                                                                                                    <div className="flex flex-col gap-2">
                                                                                                                        <Label htmlFor="name">
                                                                                                                            이름
                                                                                                                        </Label>
                                                                                                                        <Input
                                                                                                                            id="name"
                                                                                                                            name="name"
                                                                                                                            placeholder="굿즈 종류 입력"
                                                                                                                            autoComplete="off"
                                                                                                                            required
                                                                                                                        />
                                                                                                                    </div>

                                                                                                                </div>
                                                                                                                <DialogFooter>
                                                                                                                    <Button type="submit">등록</Button>
                                                                                                                </DialogFooter>
                                                                                                            </form>
                                                                                                        </DialogContent>
                                                                                                    </Dialog>
                                                                                                </CommandEmpty>
                                                                                                <CommandGroup>
                                                                                                    {categoryOptions.map((category) => (
                                                                                                        <CommandItem
                                                                                                            value={category.value}
                                                                                                            key={category.value}
                                                                                                            onSelect={() => {
                                                                                                                const newProducts = [...field.value];
                                                                                                                newProducts[index] = {
                                                                                                                    ...newProducts[index],
                                                                                                                    category: category.value,
                                                                                                                };
                                                                                                                field.onChange(newProducts);

                                                                                                                const newStates = [...categoryOpen];
                                                                                                                newStates[index] = false;
                                                                                                                setCategoryOpen(newStates);
                                                                                                            }}
                                                                                                        >
                                                                                                            <Check
                                                                                                                className={cn(
                                                                                                                    "mr-2 h-4 w-4",
                                                                                                                    category.value === product.category
                                                                                                                        ? "opacity-100"
                                                                                                                        : "opacity-0"
                                                                                                                )}
                                                                                                            />
                                                                                                            {category.label}
                                                                                                        </CommandItem>
                                                                                                    ))}
                                                                                                </CommandGroup>
                                                                                            </CommandList>
                                                                                        </Command>
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                            </div>
                                                                            <div>
                                                                                <Label htmlFor={`prodAuthor-${index}`}>작가</Label>
                                                                                <Popover open={productAuthorOpen[index] || false} onOpenChange={() => {
                                                                                    const newStates = [...productAuthorOpen];
                                                                                    newStates[index] = !newStates[index];
                                                                                    setProductAuthorOpen(newStates);
                                                                                }}>
                                                                                    <PopoverTrigger asChild>
                                                                                        <FormControl>
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                role="combobox"
                                                                                                className={cn(
                                                                                                    "w-full justify-between",
                                                                                                    !field.value && "text-muted-foreground"
                                                                                                )}
                                                                                                onClick={() => {
                                                                                                    const newStates = [...productAuthorOpen];
                                                                                                    newStates[index] = true;
                                                                                                    setProductAuthorOpen(newStates);
                                                                                                }}
                                                                                            >
                                                                                                작가 추가

                                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                            </Button>
                                                                                        </FormControl>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className="w-full p-0">
                                                                                        <Command>
                                                                                            <CommandInput placeholder="작가 검색..." />
                                                                                            <CommandList>
                                                                                                <CommandEmpty>

                                                                                                    <Dialog open={authorDialogOpen} onOpenChange={() => setAuthorDialogOpen(!authorDialogOpen)}>
                                                                                                        <div className="flex flex-col gap-2 items-center">
                                                                                                            검색된 작가 없음
                                                                                                            <DialogTrigger asChild>
                                                                                                                {/*<Button variant="secondary" onClick={() => setAuthorDialogOpen(true)}>
                                                                                                                    작가 등록
                                                                                            </Button> */}
                                                                                                            </DialogTrigger>
                                                                                                        </div>
                                                                                                        {/*
                                                                                                        <DialogContent className="sm:max-w-[425px]">
                                                                                                            <DialogHeader>
                                                                                                                <DialogTitle>작가 등록</DialogTitle>
                                                                                                            </DialogHeader>
                                                                                                            <form onSubmit={(e) => {
                                                                                                                e.preventDefault();
                                                                                                                e.stopPropagation();
                                                                                                                const form = e.target as HTMLFormElement;
                                                                                                                const formData = new FormData(form);
                                                                                                                const name = formData.get('name') as string;
                                                                                                                const sns_x = formData.get('sns_x') as string;
                                                                                                                const isBoothAuthor = formData.get('isBoothAuthor') as boolean;
                                                                                                                RegisterAuthor({ name, sns_x })
                                                                                                                    .then((data) => {
                                                                                                                        const { author_id } = data;
                                                                                                                        const newProducts = [...field.value];
                                                                                                                        newProducts[index].authors.push(author_id);
                                                                                                                        field.onChange(newProducts);
                                                                                                                        if (isBoothAuthor) {
                                                                                                                            setSelectedAuthors([...selectedAuthors, { value: author_id, label: name, sns_x: sns_x }]);
                                                                                                                        }
                                                                                                                        setAuthorFetched(false);
                                                                                                                        setAuthorDialogOpen(false);
                                                                                                                        toast({ title: "작가 등록 완료!" })


                                                                                                                    })
                                                                                                                    .catch((error) => {
                                                                                                                        toast({ variant: "destructive", title: "작가 등록에 실패했어요.", description: "잠시 후 다시 시도해 주세요." })

                                                                                                                    });
                                                                                                            }}>
                                                                                                                <div className="flex flex-col gap-6 py-4 justify-start">
                                                                                                                    <div className="flex flex-col gap-2">
                                                                                                                        <Label htmlFor="name">
                                                                                                                            이름
                                                                                                                        </Label>
                                                                                                                        <Input
                                                                                                                            id="name"
                                                                                                                            name="name"
                                                                                                                            placeholder="작가 활동명 입력"
                                                                                                                            autoComplete="off"
                                                                                                                            required
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="flex flex-col gap-2">
                                                                                                                        <Label htmlFor="sns_x">
                                                                                                                            SNS 아이디
                                                                                                                        </Label>
                                                                                                                        <Input
                                                                                                                            id="sns_x"
                                                                                                                            name="sns_x"
                                                                                                                            autoComplete="off"

                                                                                                                            placeholder="X(Twitter) 아이디 입력"
                                                                                                                            required
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="flex gap-2">
                                                                                                                        <Checkbox id="isBoothAuthor" name="isBoothAuthor" />
                                                                                                                        <Label
                                                                                                                            htmlFor="isBoothAuthor"
                                                                                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                                                                        >
                                                                                                                            부스 참여 작가에도 추가
                                                                                                                        </Label>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <DialogFooter>
                                                                                                                    <Button type="submit">등록</Button>
                                                                                                                </DialogFooter>
                                                                                                            </form>
                                                                                                        </DialogContent>
                                                                                                        */}
                                                                                                    </Dialog>
                                                                                                </CommandEmpty>
                                                                                                <CommandGroup heading="이 부스의 작가">
                                                                                                    {selectedAuthors.map((author) => (
                                                                                                        <CommandItem
                                                                                                            value={author.value}
                                                                                                            key={author.value}
                                                                                                            onSelect={() => {
                                                                                                                const newProducts = [...field.value];
                                                                                                                const isSelected = newProducts[index].authors.includes(author.value);
                                                                                                                if (isSelected) {
                                                                                                                    newProducts[index].authors = newProducts[index].authors.filter((id) => id !== author.value);
                                                                                                                } else {
                                                                                                                    newProducts[index].authors.push(author.value);
                                                                                                                }
                                                                                                                field.onChange(newProducts);
                                                                                                            }}
                                                                                                        >
                                                                                                            <Check
                                                                                                                className={cn(
                                                                                                                    "mr-2 h-4 w-4",
                                                                                                                    product.authors.includes(author.value)
                                                                                                                        ? "opacity-100"
                                                                                                                        : "opacity-0"
                                                                                                                )}
                                                                                                            />
                                                                                                            <div className="flex flex-row gap-2">
                                                                                                                <Avatar>
                                                                                                                    <AvatarImage src={author.thumbnail} />
                                                                                                                    <AvatarFallback>
                                                                                                                        <p>{author.label[0]}</p>
                                                                                                                    </AvatarFallback>
                                                                                                                </Avatar>
                                                                                                                <div className="flex flex-col">
                                                                                                                    <p>{author.label}</p>
                                                                                                                    <p className="text-muted-foreground">{author.sns_x}</p>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </CommandItem>
                                                                                                    ))}
                                                                                                </CommandGroup>
                                                                                                <CommandSeparator />
                                                                                                <CommandGroup heading="모든 작가">
                                                                                                    {authorOptions.map((author) => (
                                                                                                        <CommandItem
                                                                                                            value={author.value}
                                                                                                            key={author.value}
                                                                                                            onSelect={() => {
                                                                                                                const newProducts = [...field.value];
                                                                                                                const isSelected = newProducts[index].authors.includes(author.value);
                                                                                                                if (isSelected) {
                                                                                                                    newProducts[index].authors = newProducts[index].authors.filter((id) => id !== author.value);
                                                                                                                } else {
                                                                                                                    newProducts[index].authors.push(author.value);
                                                                                                                }
                                                                                                                field.onChange(newProducts);
                                                                                                            }}
                                                                                                        >
                                                                                                            <Check
                                                                                                                className={cn(
                                                                                                                    "mr-2 h-4 w-4",
                                                                                                                    product.authors.includes(author.value)
                                                                                                                        ? "opacity-100"
                                                                                                                        : "opacity-0"
                                                                                                                )}
                                                                                                            />
                                                                                                            <div className="flex flex-row gap-2">

                                                                                                                <Avatar>
                                                                                                                    <AvatarImage src={author.thumbnail} />
                                                                                                                    <AvatarFallback>
                                                                                                                        <p>{author.label[0]}</p>
                                                                                                                    </AvatarFallback>
                                                                                                                </Avatar>
                                                                                                                <div className="flex flex-col">
                                                                                                                    <p>{author.label}</p>
                                                                                                                    <p className="text-muted-foreground">{author.sns_x}</p>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </CommandItem>
                                                                                                    ))}
                                                                                                </CommandGroup>
                                                                                            </CommandList>
                                                                                        </Command>
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                                {product.authors.length > 0 &&
                                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                                        {product.authors.map((authorId) => {
                                                                                            const author = authorOptions.find((a) => a.value === authorId);
                                                                                            return (
                                                                                                <Badge key={authorId} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-md">
                                                                                                    <Button
                                                                                                        className="w-4 h-4 text-muted-foreground"
                                                                                                        size="icon"
                                                                                                        asChild
                                                                                                        variant="ghost"
                                                                                                        onClick={() => {
                                                                                                            const newProducts = [...field.value];
                                                                                                            newProducts[index].authors = newProducts[index].authors.filter((id) => id !== author.value);
                                                                                                            field.onChange(newProducts);
                                                                                                        }}
                                                                                                    >
                                                                                                        <X className="h-4 w-4 mr-1" />
                                                                                                    </Button>
                                                                                                    <Avatar className="w-4 h-4">
                                                                                                        <AvatarImage src={author?.thumbnail} />
                                                                                                        <AvatarFallback>
                                                                                                            <p>{author?.label[0]}</p>
                                                                                                        </AvatarFallback>
                                                                                                    </Avatar>
                                                                                                    <p className="text-sm">{author?.label}</p>
                                                                                                </Badge>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                            {/* 나머지 굿즈 정보 입력 필드들 */}
                                                                            <div className="mt-2 flex flex-col gap-2">
                                                                                <Label className="text-md font-bold">
                                                                                    옵션
                                                                                </Label>
                                                                                <ScrollArea className="w-full h-64 rounded-md">
                                                                                    <div className="flex flex-col gap-6 w-full">
                                                                                        {(product.options || []).map((option, optionIndex) => (
                                                                                            <div className="flex flex-col">

                                                                                                <div key={optionIndex} className="flex flex-row gap-4">

                                                                                                    <div className="w-2/5">
                                                                                                        <FileUpload
                                                                                                            name={`products.${index}.options.${optionIndex}.thumbnail`}
                                                                                                            onChange={(file) => {
                                                                                                                const newProducts = [...field.value];
                                                                                                                newProducts[index].options[optionIndex].thumbnail = file;
                                                                                                                field.onChange(newProducts);
                                                                                                            }}
                                                                                                            ratio={1}
                                                                                                            maxSize={10000000}
                                                                                                            maxFiles={1}
                                                                                                            value={option.thumbnail}
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="w-3/5 flex flex-col gap-2">
                                                                                                        <div className="w-auto h-auto flex flex-col gap-1">
                                                                                                            <Label htmlFor={`products.${index}.options.${optionIndex}.name`}>이름</Label>
                                                                                                            <Input
                                                                                                                id={`products.${index}.options.${optionIndex}.name`}
                                                                                                                value={option.name}
                                                                                                                onChange={(e) => {
                                                                                                                    const newProducts = [...field.value];
                                                                                                                    newProducts[index].options[optionIndex].name = e.target.value;
                                                                                                                    field.onChange(newProducts);
                                                                                                                }}
                                                                                                                autoComplete="off"

                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="w-auto h-auto flex flex-col gap-1">
                                                                                                            <Label htmlFor={`products.${index}.options.${optionIndex}.price`}>가격</Label>
                                                                                                            <Input
                                                                                                                id={`products.${index}.options.${optionIndex}.price`}
                                                                                                                type="text"
                                                                                                                autoComplete="off"
                                                                                                                inputMode="numeric"
                                                                                                                pattern="[0-9]*"
                                                                                                                value={option.price ? new Intl.NumberFormat('ko-KR').format(option.price) + '원' : ''}
                                                                                                                onChange={(e) => {
                                                                                                                    const newProducts = [...field.value];
                                                                                                                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                                                    const price = inputValue === '' ? null : parseInt(inputValue, 10);
                                                                                                                    newProducts[index].options[optionIndex].price = price;
                                                                                                                    field.onChange(newProducts);
                                                                                                                }}
                                                                                                                onKeyDown={(e) => {
                                                                                                                    if (e.key === 'Backspace') {
                                                                                                                        const newProducts = [...field.value];
                                                                                                                        const currentValue = newProducts[index].options[optionIndex].price;
                                                                                                                        if (currentValue !== null) {
                                                                                                                            const stringValue = currentValue.toString();
                                                                                                                            const newValue = stringValue.slice(0, -1);
                                                                                                                            const price = newValue === '' ? null : parseInt(newValue, 10);
                                                                                                                            newProducts[index].options[optionIndex].price = price;
                                                                                                                            field.onChange(newProducts);
                                                                                                                        }
                                                                                                                    }
                                                                                                                }}
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="w-auto h-auto flex flex-col gap-1">
                                                                                                            <Label htmlFor={`products.${index}.options.${optionIndex}.characters`}>캐릭터</Label>
                                                                                                            <Popover open={characterOpen[index * 100 + optionIndex] || false} onOpenChange={() => {
                                                                                                                const newStates = [...characterOpen];
                                                                                                                newStates[index * 100 + optionIndex] = !newStates[index * 100 + optionIndex];
                                                                                                                setCharacterOpen(newStates);
                                                                                                            }}>
                                                                                                                <PopoverTrigger asChild>
                                                                                                                    <FormControl>
                                                                                                                        <Button
                                                                                                                            variant="outline"
                                                                                                                            role="combobox"
                                                                                                                            className={cn(
                                                                                                                                "w-full justify-between",
                                                                                                                                !field.value && "text-muted-foreground"
                                                                                                                            )}
                                                                                                                            onClick={() => setCharacterOpen(true)}
                                                                                                                        >
                                                                                                                            캐릭터 추가

                                                                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                                        </Button>
                                                                                                                    </FormControl>
                                                                                                                </PopoverTrigger>
                                                                                                                <PopoverContent className="w-full p-0">
                                                                                                                    <Command>
                                                                                                                        <CommandInput placeholder="캐릭터 검색..." />
                                                                                                                        <CommandList>
                                                                                                                            <CommandEmpty>
                                                                                                                                <Dialog open={characterDialogOpen} onOpenChange={() => setCharacterDialogOpen(!characterDialogOpen)}>
                                                                                                                                    <div className="flex flex-col gap-2 items-center">
                                                                                                                                        검색된 캐릭터 없음
                                                                                                                                        {/*<DialogTrigger asChild>
                                                                                                                                            <Button variant="secondary" >
                                                                                                                                                캐릭터 등록
                                                                                                                                            </Button>
                                                                                                                            </DialogTrigger>*/}
                                                                                                                                    </div>
                                                                                                                                    {/*
                                                                                                                                    <DialogContent className="sm:max-w-[425px]">
                                                                                                                                        <DialogHeader>
                                                                                                                                            <DialogTitle>캐릭터 등록</DialogTitle>
                                                                                                                                        </DialogHeader>
                                                                                                                                        <form onSubmit={(e) => {
                                                                                                                                            e.preventDefault();
                                                                                                                                            e.stopPropagation();
                                                                                                                                            const form = e.target as HTMLFormElement;
                                                                                                                                            const formData = new FormData(form);
                                                                                                                                            const name = formData.get('name') as string;
                                                                                                                                            const genre = formData.get('genre') as string;
                                                                                                                                            RegisterAuthor({ name, genre })
                                                                                                                                                .then((data) => {
                                                                                                                                                    const { character_id, name, genre } = data;
                                                                                                                                                    setSelectedCharacters([...selectedCharacters, { value: character_id, label: name, genre: genre }]);
                                                                                                                                                    field.onChange([...(field.value || []), character_id]);
                                                                                                                                                    setCharacterDialogOpen(false)
                                                                                                                                                })
                                                                                                                                                .catch((error) => {
                                                                                                                                                    console.error('Failed to register author:', error);
                                                                                                                                                });
                                                                                                                                        }}>
                                                                                                                                            <div className="flex flex-col gap-6 py-4 justify-start">
                                                                                                                                                <div className="flex flex-col gap-2">
                                                                                                                                                    <Label htmlFor="name">
                                                                                                                                                        이름
                                                                                                                                                    </Label>
                                                                                                                                                    <Input
                                                                                                                                                        id="name"
                                                                                                                                                        name="name"
                                                                                                                                                        required
                                                                                                                                                        autoComplete="off"

                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                                <div className="flex flex-col gap-2">
                                                                                                                                                    <Label htmlFor="sns_x">
                                                                                                                                                        장르
                                                                                                                                                    </Label>
                                                                                                                                                    <Input
                                                                                                                                                        id="sns_x"
                                                                                                                                                        name="sns_x"
                                                                                                                                                        required
                                                                                                                                                        autoComplete="off"

                                                                                                                                                    />
                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                            <DialogFooter>
                                                                                                                                                <Button type="submit">등록</Button>
                                                                                                                                            </DialogFooter>
                                                                                                                                        </form>
                                                                                                                                    </DialogContent>*/}
                                                                                                                                </Dialog>

                                                                                                                            </CommandEmpty>
                                                                                                                            <CommandGroup>
                                                                                                                                {characterOptions.map((character) => (
                                                                                                                                    <CommandItem
                                                                                                                                        value={character.value}
                                                                                                                                        key={character.value}
                                                                                                                                        onSelect={() => {
                                                                                                                                            const isSelected = option.characters.includes(character.value);
                                                                                                                                            if (isSelected) {
                                                                                                                                                const newProducts = [...field.value];
                                                                                                                                                newProducts[index].options[optionIndex].characters = newProducts[index].options[optionIndex].characters.filter((id) => id !== character.value);
                                                                                                                                                field.onChange(newProducts);
                                                                                                                                                setSelectedCharacters(selectedCharacters.filter((selectedCharacter) => selectedCharacter.value !== character.value));
                                                                                                                                            } else {
                                                                                                                                                const newProducts = [...field.value];
                                                                                                                                                newProducts[index].options[optionIndex].characters.push(character.value);
                                                                                                                                                field.onChange(newProducts);
                                                                                                                                                setCharacter(true);
                                                                                                                                                setSelectedCharacters([...selectedCharacters, character]);
                                                                                                                                            }
                                                                                                                                        }}
                                                                                                                                    >
                                                                                                                                        <Check
                                                                                                                                            className={cn(
                                                                                                                                                "mr-2 h-4 w-4",
                                                                                                                                                option.characters.includes(character.value)
                                                                                                                                                    ? "opacity-100"
                                                                                                                                                    : "opacity-0"
                                                                                                                                            )}
                                                                                                                                        />
                                                                                                                                        <div className="flex flex-row gap-2">
                                                                                                                                            <Avatar>
                                                                                                                                                <AvatarImage src={character.thumbnail} />
                                                                                                                                                <AvatarFallback>
                                                                                                                                                    <p>{character.label[0]}</p>
                                                                                                                                                </AvatarFallback>
                                                                                                                                            </Avatar>
                                                                                                                                            <div className="flex flex-col">
                                                                                                                                                <p>{character.label}</p>
                                                                                                                                                <p className="text-muted-foreground">{character.genre}</p>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </CommandItem>
                                                                                                                                ))}
                                                                                                                            </CommandGroup>
                                                                                                                        </CommandList>
                                                                                                                    </Command>
                                                                                                                </PopoverContent>
                                                                                                            </Popover>
                                                                                                        </div>

                                                                                                    </div>

                                                                                                </div>
                                                                                                <div className="flex flex-col gap-2">
                                                                                                    <div className="flex mt-2 flex-row flex-wrap gap-2 overflow-auto">
                                                                                                        {option.characters.map((characterId) => {
                                                                                                            const character = characterOptions.find((c) => c.value === characterId);
                                                                                                            if (character) {
                                                                                                                return (
                                                                                                                    <Badge key={characterId} className="flex items-center gap-1 px-2 py-1 rounded-md" variant="secondary">
                                                                                                                        <Button
                                                                                                                            className="w-4 h-4 text-muted-foreground"
                                                                                                                            size="icon"
                                                                                                                            asChild
                                                                                                                            variant="ghost"
                                                                                                                            onClick={() => {
                                                                                                                                const newProducts = [...field.value];
                                                                                                                                newProducts[index].options[optionIndex].characters = newProducts[index].options[optionIndex].characters.filter((id) => id !== characterId);
                                                                                                                                field.onChange(newProducts);
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            <X className="h-4 w-4 mr-1" />
                                                                                                                        </Button>
                                                                                                                        {character.label}
                                                                                                                    </Badge>
                                                                                                                );
                                                                                                            }
                                                                                                            return null;
                                                                                                        })}
                                                                                                    </div>
                                                                                                    {editMode && product.options.length > 1 && (
                                                                                                        <Button
                                                                                                            type="button"
                                                                                                            variant="destructive"
                                                                                                            onClick={() => {
                                                                                                                if (product.options.length > 1) {
                                                                                                                    const newProducts = [...field.value];
                                                                                                                    newProducts[index].options = newProducts[index].options.filter((_, i) => i !== optionIndex);
                                                                                                                    field.onChange(newProducts);

                                                                                                                    const newCharacterOpen = characterOpen.filter((_, i) => i !== index * 100 + optionIndex);
                                                                                                                    setCharacterOpen(newCharacterOpen);
                                                                                                                }
                                                                                                            }}
                                                                                                        >
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <Trash className="w-4 h-4" />
                                                                                                                옵션 삭제
                                                                                                            </div>
                                                                                                        </Button>
                                                                                                    )}
                                                                                                    <Separator />
                                                                                                </div>
                                                                                            </div>

                                                                                        ))}
                                                                                    </div>
                                                                                    <ScrollBar />
                                                                                </ScrollArea>

                                                                                <Button
                                                                                    type="button"
                                                                                    variant="secondary"
                                                                                    className="w-full"
                                                                                    onClick={() => {
                                                                                        const newProducts = [...field.value];
                                                                                        if (!newProducts[index].options) {
                                                                                            newProducts[index].options = [];
                                                                                        }
                                                                                        newProducts[index].options.push({
                                                                                            thumbnail: null,
                                                                                            name: "",
                                                                                            price: undefined,
                                                                                            characters: [],
                                                                                        });
                                                                                        field.onChange(newProducts);
                                                                                        setCharacterOpen([...characterOpen, false]);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Plus className="w-4 h-4" />
                                                                                        옵션 추가
                                                                                    </div>
                                                                                </Button>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                        <CarouselPrevious className="ml-14" />
                                                        <CarouselNext className="mr-14" />
                                                    </Carousel>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                </>
                            </TabsContent>

                            <TabsContent value="etc" asChild>
                                <>
                                    <FormField
                                        control={form.control}
                                        name="preorder"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="text-lg">선입금 및 통판</FormLabel>
                                                    <div className="flex gap-2">
                                                        {!editMode ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditMode(true)
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Pencil className="w-4 h-4" />
                                                                    편집
                                                                </div>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => {
                                                                    setEditMode(false)
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Check className="w-4 h-4" />
                                                                    확인
                                                                </div>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newPreorder = {
                                                                    title: "",
                                                                    type: "",
                                                                    date: [],
                                                                    always: false,
                                                                    url: "",
                                                                };
                                                                field.onChange([...(field.value || []), newPreorder]);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="w-4 h-4" />
                                                                추가
                                                            </div>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Carousel
                                                        className="w-full"
                                                        opts={{
                                                            align: 'start',
                                                            dragFree: true,
                                                        }}
                                                        plugins={[]}
                                                    >
                                                        <CarouselContent className="mt-4 flex items-stretch">
                                                            {(field.value || []).map((preorder, index) => (
                                                                <CarouselItem key={index} className="basis-auto pl-4 h-full">
                                                                    <Card>
                                                                        <CardContent className="flex flex-col gap-4 mt-4">
                                                                            {editMode &&
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    onClick={() => {
                                                                                        const newPreorders = field.value.filter((_, i) => i !== index);
                                                                                        field.onChange(newPreorders);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Trash className="w-4 h-4" />
                                                                                        삭제
                                                                                    </div>
                                                                                </Button>
                                                                            }
                                                                            <div>

                                                                                <Label htmlFor={`preorders.${index}.title`}>
                                                                                    제목
                                                                                </Label>
                                                                                <Input
                                                                                    id={`preorders.${index}.title`}
                                                                                    value={preorder.title}
                                                                                    onChange={(e) => {
                                                                                        const newPreorders = [...field.value];
                                                                                        newPreorders[index].title = e.target.value;
                                                                                        field.onChange(newPreorders);
                                                                                    }}
                                                                                    autoComplete="off"

                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col gap-1">
                                                                                <Label htmlFor={`preorders.${index}.type`}>
                                                                                    분류
                                                                                </Label>
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <Button variant="outline" className="w-full justify-between">
                                                                                            {preorder.type === 'survey'
                                                                                                ? '수요조사'
                                                                                                : preorder.type === 'preorder'
                                                                                                    ? '선입금'
                                                                                                    : preorder.type === 'ship'
                                                                                                        ? '통판'
                                                                                                        : '분류 선택...'}
                                                                                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent className="w-56">
                                                                                        <DropdownMenuRadioGroup
                                                                                            value={preorder.type}
                                                                                            onValueChange={(value) => {
                                                                                                const newPreorders = [...field.value];
                                                                                                newPreorders[index].type = value;
                                                                                                field.onChange(newPreorders);
                                                                                            }}
                                                                                        >
                                                                                            <DropdownMenuRadioItem value="survey">수요조사</DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value="preorder">선입금</DropdownMenuRadioItem>
                                                                                            <DropdownMenuRadioItem value="ship">통판</DropdownMenuRadioItem>
                                                                                        </DropdownMenuRadioGroup>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </div>
                                                                            <div>
                                                                                <Label htmlFor={`preorders.${index}.date`}>
                                                                                    기간
                                                                                </Label>
                                                                                <DatePickerWithRange
                                                                                    value={preorder.date}
                                                                                    onChange={(value) => {
                                                                                        const newPreorders = [...field.value];
                                                                                        newPreorders[index].date = value;
                                                                                        field.onChange(newPreorders);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label htmlFor={`preorders.${index}.url`}>
                                                                                    링크
                                                                                </Label>
                                                                                <Input
                                                                                    id={`preorders.${index}.url`}
                                                                                    type="url"
                                                                                    value={preorder.url}
                                                                                    onChange={(e) => {
                                                                                        const newPreorders = [...field.value];
                                                                                        newPreorders[index].url = e.target.value;
                                                                                        field.onChange(newPreorders);
                                                                                    }}
                                                                                    autoComplete="off"

                                                                                />
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                        <CarouselPrevious className="ml-14" />
                                                        <CarouselNext className="mr-14" />
                                                    </Carousel>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="genre"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-lg">장르</FormLabel>
                                                <Popover open={genreOpen} onOpenChange={() => {
                                                    setGenreOpen(!genreOpen)
                                                }}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full md:w-[250px] justify-between",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                                onClick={() => {
                                                                    setGenreOpen(!genreOpen)
                                                                }}
                                                            >
                                                                장르 추가

                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="장르 검색..." />
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    <Dialog open={genreDialogOpen} onOpenChange={() => setGenreDialogOpen(!genreDialogOpen)}>
                                                                        <div className="flex flex-col gap-2 items-center">
                                                                            검색된 장르 없음
                                                                            {/*
                                                                            <DialogTrigger asChild>
                                                                                <Button variant="secondary" onClick={() => setGenreDialogOpen(true)}>
                                                                                    장르 등록
                                                                                </Button>
                                                            </DialogTrigger>*/}
                                                                        </div>
                                                                        {/*
                                                                        <DialogContent className="sm:max-w-[425px]">
                                                                            <DialogHeader>
                                                                                <DialogTitle>장르 등록</DialogTitle>
                                                                            </DialogHeader>
                                                                            <form onSubmit={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                const form = e.target as HTMLFormElement;
                                                                                const formData = new FormData(form);
                                                                                const name = formData.get('name') as string;
                                                                                const genre = formData.get('genre') as string;
                                                                                RegisterAuthor({ name, genre })
                                                                                    .then((data) => {
                                                                                        const { character_id, name, genre } = data;
                                                                                        setSelectedCharacters([...selectedCharacters, { value: character_id, label: name, genre: genre }]);
                                                                                        field.onChange([...(field.value || []), character_id]);
                                                                                        setCharacterDialogOpen(false)
                                                                                    })
                                                                                    .catch((error) => {
                                                                                        console.error('Failed to register author:', error);
                                                                                    });
                                                                            }}>
                                                                                <div className="flex flex-col gap-6 py-4 justify-start">
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <Label htmlFor="name">
                                                                                            이름
                                                                                        </Label>
                                                                                        <Input
                                                                                            id="name"
                                                                                            name="name"
                                                                                            required
                                                                                            autoComplete="off"

                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <Label htmlFor="sns_x">
                                                                                            장르
                                                                                        </Label>
                                                                                        <Input
                                                                                            id="sns_x"
                                                                                            name="sns_x"
                                                                                            autoComplete="off"

                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <DialogFooter>
                                                                                    <Button type="submit">등록</Button>
                                                                                </DialogFooter>
                                                                            </form>
                                                                        </DialogContent>
                                                                        */}
                                                                    </Dialog>
                                                                </CommandEmpty>
                                                                <CommandSeparator />
                                                                <CommandGroup>
                                                                    {genreOptions.map((genre) => (
                                                                        <CommandItem
                                                                            value={genre.value}
                                                                            key={genre.value}
                                                                            onSelect={() => {
                                                                                const newGenres = [...(field.value || [])];
                                                                                const isSelected = newGenres.includes(genre.value);
                                                                                if (isSelected) {
                                                                                    field.onChange(newGenres.filter((id) => id !== genre.value));
                                                                                } else {
                                                                                    field.onChange([...newGenres, genre.value]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value.includes(genre.value)
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />

                                                                            {genre.label}

                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {field.value.length > 0 &&
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {field.value.map((genreId) => {
                                                            const genre = genreOptions.find((a) => a.value === genreId);
                                                            return (
                                                                <Badge key={genreId} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-md">
                                                                    <Button
                                                                        className="w-4 h-4 text-muted-foreground"
                                                                        size="icon"
                                                                        asChild
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            const newGenres = field.value.filter((id) => id !== genreId);
                                                                            field.onChange(newGenres);
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4 mr-1" />
                                                                    </Button>
                                                                    <p className="text-sm">{genre?.label}</p>
                                                                </Badge>
                                                            );
                                                        })}

                                                    </div>
                                                }
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent pb-6 pt-6">
                                        {isValid ? (
                                            isSubmitting ? (
                                                <Button type="button" variant="default" className="w-full lg:w-auto" size="lg" disabled >
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    잠시만 기다려 주세요...
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    variant="default"
                                                    className="w-full lg:w-auto"
                                                    size="lg"
                                                >
                                                    제출
                                                </Button>
                                            )
                                        ) : (
                                            <Button type="button" variant="destructive" className="w-full lg:w-auto" size="lg" disabled>
                                                입력한 내용을 확인해 주세요
                                            </Button>
                                        )}
                                    </div>

                                </>
                            </TabsContent>

                        </form>
                    </Form>
                </Tabs>

            </CardContent >
            <div className="w-full px-10">
            </div>
        </Card >
    )
}

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: Date[];
    onChange?: (value: Date[]) => void;
}

export function DatePickerWithRange({
    className,
    value,
    onChange,
}: DatePickerWithRangeProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (value && value.length === 2) {
            return { from: value[0], to: value[1] };
        }
        return undefined;
    });
    const [startTime, setStartTime] = useState('00:00')
    const [endTime, setEndTime] = useState('23:59')

    useEffect(() => {
        if (value && value.length === 2) {
            setDateRange({ from: value[0], to: value[1] });
        } else {
            setDateRange(undefined);
        }
    }, [value])

    const formatDate = (date: Date | undefined) => {
        if (date && !isNaN(date.getTime())) {
            return format(date, "M월 d일");
        }
        return '';
    };

    const formatDateRange = () => {
        if (!dateRange || !dateRange.from || !dateRange.to) return '날짜 선택...'
        const { from, to } = dateRange
        const isSameDay = from.getDate() === to.getDate() && from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
        const formattedFrom = `${formatDate(from)} ${startTime}`
        const formattedTo = isSameDay ? endTime : `${formatDate(to)} ${endTime}`
        return `${formattedFrom} - ${formattedTo}`
    }

    const handleStartTimeChange = (value: string) => {
        setStartTime(value);
        if (dateRange?.from && dateRange?.to && dateRange.from.getTime() === dateRange.to.getTime()) {
            if (value > endTime) {
                setEndTime(value);
            }
        }
        if (onChange && dateRange) {
            const fromDateTime = new Date(dateRange.from);
            fromDateTime.setHours(parseInt(value.split(":")[0]), parseInt(value.split(":")[1]));
            onChange([fromDateTime, dateRange.to]);
        }
    };

    const handleEndTimeChange = (value: string) => {
        setEndTime(value);
        if (dateRange?.from && dateRange?.to && dateRange.from.getTime() === dateRange.to.getTime()) {
            if (value < startTime) {
                setStartTime(value);
            }
        }
        if (onChange && dateRange) {
            const toDateTime = new Date(dateRange.to);
            toDateTime.setHours(parseInt(value.split(":")[0]), parseInt(value.split(":")[1]));
            onChange([dateRange.from, toDateTime]);
        }
    };

    const handleDateRangeChange = (value: DateRange | undefined) => {
        setDateRange(value);
        if (onChange && value) {
            const fromDateTime = new Date(value.from);
            fromDateTime.setHours(parseInt(startTime.split(":")[0]), parseInt(startTime.split(":")[1]));

            const toDateTime = new Date(value.to);
            toDateTime.setHours(parseInt(endTime.split(":")[0]), parseInt(endTime.split(":")[1]));

            onChange([fromDateTime, toDateTime]);
        } else if (onChange) {
            onChange([]);
        }
    };
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <ScrollArea className="w-full h-72 md:h-full">
                        <div className="w-full">
                            <Calendar
                                mode="range"
                                defaultMonth={dateRange?.from || new Date()}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={1}
                                locale={ko}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-between gap-4 p-2">
                            <div className="w-full">
                                <Label htmlFor="start-time">
                                    시작 시간
                                </Label>
                                <Input
                                    id="start-time"
                                    type="time"
                                    className="w-full"
                                    value={startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    autoComplete="off"

                                />
                            </div>
                            <div className="w-full">
                                <Label htmlFor="end-time">
                                    종료 시간
                                </Label>
                                <Input
                                    id="end-time"
                                    type="time"
                                    className="w-full"
                                    value={endTime}
                                    onChange={(e) => handleEndTimeChange(e.target.value)}
                                    autoComplete="off"

                                />
                            </div>
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    )
}