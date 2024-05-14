'use client'
import React, { useState, useEffect, useRef } from 'react';
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
import { X } from 'lucide-react';

const preventMapReset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault(); // 추가: 기본 이벤트도 방지
};
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

function IndoorMap({ boothLocations }: { boothLocations: BoothLocation[] }) {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
    const [boothData, setBoothData] = useState<any>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            d3.select(svgRef.current).selectAll('g').attr('transform', event.transform);
        });


    const searchParams = useSearchParams();
    const search = searchParams.get('event');

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
                            const location = boothLocations?.find(loc => loc.id === d.properties.id);
                            const boothExists = boothData.some((booth: any) => booth.locations.includes(d.properties.id));

                            if (location) {
                                return location.color;
                            } if (boothExists) {
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
                                        const location = boothLocations?.find(loc => loc.id === d.properties.id);
                                        if (location) {
                                            return d3.hsl(location.color).brighter(1).toString();
                                        }
                                        return d3.hsl("white").darker(0.5).toString();

                                    }
                                    return d3.select(this).attr("fill");
                                })
                                .transition()
                                .duration(1000)
                                .attr("fill", function (d) {
                                    if (selectedBooth && boothData.some((booth: any) => booth.locations.includes(selectedBooth) && booth.locations.includes(d.properties.id))) {
                                        const location = boothLocations?.find(loc => loc.id === d.properties.id);
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
                        .append("text")
                        .attr("x", d => pathGenerator.centroid(d)[0])
                        .attr("y", d => pathGenerator.centroid(d)[1])
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "central")
                        .text(d => d.properties.id)
                        .attr("pointer-events", "none")
                        .attr("font-weight", "bold")
                        .attr("font-size", "30px")
                        .attr("fill", d => {
                            const location = boothLocations?.find(loc => loc.id === d.properties.id);
                            if (location) {
                                return "white";
                            }
                            const boothExists = boothData.some((booth: any) => booth.locations.includes(d.properties.id));
                            return boothExists ? "black" : "none";
                        })
                        .attr("transform", d => {
                            const bounds = pathGenerator.bounds(d);
                            const width = bounds[1][0] - bounds[0][0];
                            const height = bounds[1][1] - bounds[0][1];
                            return height > width ? `rotate(90 ${pathGenerator.centroid(d)})` : "";
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
    }, [mapData, boothLocations, selectedBooth]);

    if (!mapData) {
        return <div className="w-full h-full flex items-center justify-center">
            <div className="text-xl font-bold">행사 지도가 등록되지 않았어요</div>
        </div>;
    }
    return (
        <div className="w-full h-full relative">
            <svg ref={svgRef} className="w-full h-full rounded-lg" />

            {selectedBooth && boothData && (
                <div className="absolute bottom-0 w-full">
                    <Carousel>
                        <CarouselContent>
                            {boothData.map((booth: any) => {
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
                                                    <LikeButton booth={booth}
                                                    />
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