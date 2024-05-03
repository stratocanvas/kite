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

const supabase = createClient()

interface MapData {
    name: string;
    map_image: string;
    map_data: string; // URL of the JSON file
}

interface BoothLocation {
    id: string;
    color: string;
}

const IndoorMap = ({ boothLocations }: { boothLocations: BoothLocation[] }) => {
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
    const search = searchParams.get('id');

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
                        .attr("fill", d => {
                            const locationExists = boothLocations.includes(d.properties.id);
                            return locationExists ? "rgb(255,59,48)" : (d.properties.layer === "background" ? "none" : "white");
                        })
                        .attr("stroke", d => d.properties.id !== "bg" ? "black" : "none")
                        .on("click", (event, d) => {
                            setSelectedBooth(d.properties.id);
                        });

                    // Apply zoom to both image and paths
                    const zoom = d3.zoom()
                        .scaleExtent([1, 8])
                        .on('zoom', (event) => {
                            imageGroup.attr('transform', event.transform);
                            pathGroup.attr('transform', event.transform);
                        });

                    svg.call(zoom);
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
    }, [mapData, boothLocations]);

    if (!mapData) {
        return <div className="w-full h-full flex items-center justify-center">
            <div className="text-xl font-bold">행사 지도가 등록되지 않았어요</div>
        </div>;
    }

    return (
        <div className="w-full h-full relative">
            <svg ref={svgRef} className="w-full h-full" />

            {selectedBooth && boothData && (
                <div className="absolute bottom-0 w-full">
                    {boothData.map((booth: any) => {
                        if (booth.locations.includes(selectedBooth)) {
                            return (
                                <Card key={booth.booth_id}>
                                    <CardHeader>
                                        <CardTitle>{booth.name}</CardTitle>
                                        <CardDescription>
                                            {booth.locations.sort().length > 1 ? `${booth.locations[0]}-${booth.locations[booth.locations.length - 1]}` : booth.locations[0]}
                                            {" "}· {Array.isArray(booth?.date) && booth?.date.length === 2
                                                ? "양일"
                                                : new Date(booth?.date).toLocaleDateString("ko-KR", {
                                                    weekday: "long",
                                                })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setSelectedBooth(null)}>닫기</Button>
                                        <Link href={`/booth/${booth.booth_id}`}>
                                            <Button >자세히 보기</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};

export default IndoorMap;