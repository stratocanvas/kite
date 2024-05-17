'use client'
import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from "d3";
import { geoIdentity, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LikeButton } from '../booth/[id]/buttons/booth-menu';
import { X, Eye, ShoppingBag, Heart } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const supabase = createClient()

interface MapData {
    name: string;
    map_image: string;
    map_data: string; // URL of the JSON file
}

interface BoothLocation {
    id: string;
    color: string;
    type: 'wishlist' | 'cart';
}

function IndoorMap({ boothLocations, items }: { boothLocations: BoothLocation[], items: any }) {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
    const [boothData, setBoothData] = useState<any>(null);
    const [view, setView] = useState<'all' | 'wishlist' | 'cart'>('all');
    const svgRef = useRef<SVGSVGElement>(null);
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            d3.select(svgRef.current).selectAll('g').attr('transform', event.transform);
        });

    const searchParams = useSearchParams();
    const search = searchParams.get('event');

    const filteredBoothLocations = useMemo(() => {
        if (view === 'all') {
            return boothLocations;
        }
        return boothLocations.filter((booth: any) => booth.type === view);
    }, [boothLocations, view]);

    useEffect(() => {
        const fetchMapData = async () => {
            const { data: eventMap, error: eventError } = await supabase
                .from("event")
                .select('name, map_image, map_data')
                .eq("event_id", search)
                .limit(1)
                .single();

            const { data: booth, error: boothError } = await supabase
                .from("booth")
                .select('booth_id, name, locations, date')
                .eq("event_id", search)


            if (eventError || boothError || !eventMap || !eventMap.map_data || !eventMap.map_image) {
                console.error('Error fetching map data:', eventError || boothError);
                setMapData(null);
            } else {
                setMapData(eventMap);
                setBoothData(booth);
            }
        };

        fetchMapData();
    }, [search]);

    useEffect(() => {
        d3.select(svgRef.current).call(zoom);
        if ('ontouchstart' in window) {
            d3.select(svgRef.current).call(d3.zoom().on("zoom", (event) => {
                d3.select(svgRef.current).selectAll('g').attr('transform', event.transform);
            }));
        }
    }, [zoom]);

    useEffect(() => {
        if (!mapData || !mapData.map_data || !mapData.map_image) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        }

        const drawMap = async () => {
            try {
                const topojsonData = await d3.json(mapData.map_data);
                if (!topojsonData) {
                    throw new Error("TopoJSON data is null");
                }
                const svg = d3.select(svgRef.current);
                svg.selectAll("*").remove(); // Clear SVG before drawing

                const img = new Image();
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;

                    svg.attr("viewBox", `0 0 ${width} ${height}`); // Set viewBox instead of width and height


                    const projection = geoIdentity().reflectY(true).fitSize([width, height], feature(topojsonData, topojsonData.objects['event-map']));
                    const pathGenerator = geoPath().projection(projection);

                    const imageGroup = svg.append("g");
                    imageGroup.append("image")
                        .attr("xlink:href", mapData.map_image)
                        .attr("width", width)
                        .attr("height", height);

                    const pathGroup = svg.append("g");

                    pathGroup.selectAll("path")
                        .data(feature(topojsonData, topojsonData.objects['event-map']).features)
                        .enter()
                        .append("path")
                        .attr("d", pathGenerator)
                        .attr("fill", (d) => {
                            const location = filteredBoothLocations?.find(loc => loc.id === d.properties.id);
                            const boothExists = boothData.some((booth: any) => booth.locations.includes(d.properties.id));
                            const completed = filteredBoothLocations.find(loc => loc.id === d.properties.id)?.completed;
                            if (completed) {
                                return "rgb(174,174,178)";
                            }
                            if (location) {
                                return location.color;
                            }
                            if (boothExists) {
                                return "white";
                            }

                            return d.properties.layer === "background" ? "none" : "gray";
                        })
                        .attr("stroke", d => d.properties.id !== "bg" ? "black" : "none")
                        .on("click", (event, d) => {
                            setSelectedBooth(d.properties.id);
                        })
                        .transition() // 깜빡이는 효과를 위한 트랜지션 추가
                        .on("start", function repeat() {
                            d3.active(this)
                                .transition()
                                .duration(1000)
                                .attr("fill", function (d) {
                                    if (selectedBooth && boothData.some((booth: any) => booth.locations.includes(selectedBooth) && booth.locations.includes(d.properties.id))) {
                                        const location = filteredBoothLocations?.find(loc => loc.id === d.properties.id);
                                        const completed = filteredBoothLocations.find(loc => loc.id === d.properties.id)?.completed;
                                        if (completed) {
                                            return d3.hsl("rgb(174,174,178)").brighter(0.5).toString();
                                        }
                                        if (location) {
                                            return d3.hsl(location.color).brighter(0.5).toString();
                                        }
                                        return d3.hsl("white").darker(0.5).toString();

                                    }
                                    return d3.select(this).attr("fill");
                                })
                                .transition()
                                .duration(1000)
                                .attr("fill", function (d) {
                                    if (selectedBooth && boothData.some((booth: any) => booth.locations.includes(selectedBooth) && booth.locations.includes(d.properties.id))) {
                                        const location = filteredBoothLocations?.find(loc => loc.id === d.properties.id);
                                        const completed = filteredBoothLocations.find(loc => loc.id === d.properties.id)?.completed;
                                        if (completed) {
                                            return "rgb(174,174,178)";
                                        }
                                        if (location) {
                                            return location.color;
                                        }
                                        return "white";

                                    }
                                    return d3.select(this).attr("fill");
                                })
                                .on("end", repeat);
                        });


                    // 텍스트 추가
                    pathGroup.selectAll("text")
                        .data(feature(topojsonData, topojsonData.objects['event-map']).features)
                        .enter()
                        .append("g")
                        .attr("transform", d => {
                            const [x, y] = pathGenerator.centroid(d);
                            return `translate(${x}, ${y})`;
                        })
                        .each(function (d) {
                            const bounds = pathGenerator.bounds(d);
                            const width = bounds[1][0] - bounds[0][0];
                            const height = bounds[1][1] - bounds[0][1];
                            const checkSize = Math.min(width, height) * 0.8;
                            const cartSize = Math.min(width, height) * 0.3;
                            const inCart = filteredBoothLocations?.some(loc => loc.id === d.properties.id && loc.type === 'cart');
                            if (inCart && view !== 'wishlist') {
                                const iconGroup = d3.select(this).append("svg")
                                    .attr("xmlns", "http://www.w3.org/2000/svg")
                                    .attr("width", cartSize)
                                    .attr("height", cartSize)
                                    .attr("viewBox", "0 0 24 24")
                                    .attr("fill", "none")
                                    .attr("stroke", "white")
                                    .attr("stroke-width", "2")
                                    .attr("stroke-linecap", "round")
                                    .attr("stroke-linejoin", "round")
                                    .attr("class", "lucide lucide-shopping-bag")
                                    .attr("x", width / 2 - cartSize * 1.15) // 오른쪽 끝에 위치하도록 x 좌표 설정
                                    .attr("y", height / 2 - cartSize * 1.15); // 아래쪽 끝에 위치하도록 y 좌표 설정

                                iconGroup.append("path")
                                    .attr("d", "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z");

                                iconGroup.append("path")
                                    .attr("d", "M3 6h18");

                                iconGroup.append("path")
                                    .attr("d", "M16 10a4 4 0 0 1-8 0");
                            }
                            const completed = filteredBoothLocations.find(loc => loc.id === d.properties.id)?.completed;
                            if (completed) {
                                d3.select(this).append("svg")
                                    .attr("xmlns", "http://www.w3.org/2000/svg")
                                    .attr("width", checkSize)
                                    .attr("height", checkSize)
                                    .attr("viewBox", "0 0 24 24")
                                    .attr("fill", "none")
                                    .attr("stroke", "white")
                                    .attr("stroke-width", "2")
                                    .attr("stroke-linecap", "round")
                                    .attr("stroke-linejoin", "round")
                                    .attr("class", "lucide lucide-check")
                                    .attr("x", -checkSize / 2)
                                    .attr("y", -checkSize / 2)
                                    .append("path")
                                    .attr("d", "M20 6 9 17l-5-5");
                            } else {
                                d3.select(this).append("text")
                                    .attr("text-anchor", "middle")
                                    .attr("alignment-baseline", "central")
                                    .text(d.properties.id)
                                    .attr("font-weight", "bold")
                                    .attr("font-size", `${height * 0.55}px`)
                                    .attr("fill", () => {
                                        const location = filteredBoothLocations?.find(loc => loc.id === d.properties.id);
                                        if (location) {
                                            return "white";
                                        }
                                        const boothExists = boothData.some((booth: any) => booth.locations.includes(d.properties.id));
                                        return boothExists ? "black" : "none";
                                    })
                                    .attr("transform", () => {
                                        return height > width ? `rotate(90 ${pathGenerator.centroid(d)})` : "";
                                    });
                            }
                        });


                    // Apply zoom to both image and paths
                    const zoom = d3.zoom()
                        .scaleExtent([1, 14])
                        .on('zoom', (event) => {
                            imageGroup.attr('transform', event.transform);
                            pathGroup.attr('transform', event.transform);
                        });

                    svg.call(zoom);

                    // 줌 배율 유지
                    const currentTransform = d3.zoomTransform(svg.node());
                    svg.call(zoom.transform, currentTransform);

                };
                img.onerror = () => {
                    throw new Error("Image could not be loaded");
                };
                img.src = mapData.map_image;
            } catch (error) {
                console.error('Error loading topojson data or image:', error);
                d3.select(svgRef.current).selectAll("*").remove();
            }
        };

        drawMap();
    }, [mapData, filteredBoothLocations, selectedBooth]);

    if (!mapData) {
        return <div className="w-full h-full flex items-center justify-center">
            <div className="text-xl font-bold">행사 지도가 등록되지 않았어요</div>
        </div>;
    }
    return (
        <div className="w-full h-full relative">
            <svg ref={svgRef} className="w-full h-full rounded-lg" />
            <div className='absolute top-4 right-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button size="sm" variant="outline" className="flex gap-2">
                            {view === 'all' ? <Eye className="w-4 h-4" /> : view === 'wishlist' ? <Heart className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            <p className="hidden md:block">{view === 'all' ? "전체" : view === 'wishlist' ? "위시리스트" : "장바구니"}</p>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={view} onValueChange={setView}>
                            <DropdownMenuLabel>보기</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioItem value="all">전체</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="wishlist">위시리스트</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="cart">장바구니</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {selectedBooth && boothData && (
                <div className="absolute bottom-0 w-full">
                    <Carousel>
                        <CarouselContent>
                            {boothData.sort((a: any, b: any) => {
                                const dateA = Array.isArray(a.date) ? a.date[0] : a.date;
                                const dateB = Array.isArray(b.date) ? b.date[0] : b.date;
                                const dayA = new Date(dateA).getDay();
                                const dayB = new Date(dateB).getDay();

                                if (dayA === 6 && dayB === 0) return -1; // 토요일이 일요일보다 앞에 옴
                                if (dayA === 0 && dayB === 6) return 1;  // 일요일이 토요일보다 뒤에 옴
                                return dayA - dayB; // 나머지 경우는 요일 순서대로 정렬
                            }).map((booth: any) => {
                                const isBoothInCart = items.some(item => item.boothId === booth.booth_id);
                                if (booth.locations.includes(selectedBooth)) {

                                    return (
                                        <CarouselItem>
                                            <Card key={booth.booth_id} className='bg-background/80 backdrop-blur-md'>
                                                <CardHeader>
                                                    <CardTitle>{booth.name}</CardTitle>
                                                    <Button type="reset" size="icon" variant="ghost" className='absolute top-4 right-4 rounded-full w-6 h-6 text-muted-foreground' onClick={() => setSelectedBooth(null)}>
                                                        <X />
                                                    </Button>

                                                    <CardDescription>
                                                        {booth.locations.sort().length > 1 ? `${booth.locations[0]}-${booth.locations[booth.locations.length - 1]}` : booth.locations[0]}
                                                        {" "}· {Array.isArray(booth?.date) && booth?.date.length === 2
                                                            ? "양일"
                                                            : new Date(booth?.date).toLocaleDateString("ko-KR", {
                                                                weekday: "long",
                                                            })}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardFooter className="flex gap-2 justify-between items-center">
                                                    <div className='flex gap-4 items-center'>
                                                        <LikeButton booth={booth} />
                                                        {isBoothInCart && <ShoppingBag className='w-6 h-6' />}
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <Link href={`/booth/${booth.booth_id}`}>
                                                            <Button >자세히 보기</Button>
                                                        </Link>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </CarouselItem>
                                    );
                                }
                                return null;
                            })}
                        </CarouselContent>
                        {boothData.filter((booth: any) => booth.locations.includes(selectedBooth)).length > 1 && (
                            <>
                                <CarouselPrevious className='bg-transparent border-none absolute top-1/2 -translate-y-1/2 left-4' />
                                <CarouselNext className='bg-transparent border-none absolute top-1/2 -translate-y-1/2 right-4' />
                            </>
                        )}
                    </Carousel>

                </div>
            )}
        </div>
    );
};

export default IndoorMap;