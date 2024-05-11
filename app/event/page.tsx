
import SearchResult from "@/app/booth/fetch";
import { SearchBarSmall } from "@/components/search/search"
import MoreBooth from "../../components/load-more";
import BoothCard from "@/components/booth-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link  from "next/link";
import { Home, Ticket, Map as MapIcon } from "lucide-react";
import  fetchEvent  from "./fetch";

async function getBoothData(searchParams: { character?: string; category?: string; genre?: string; author?: string } = {}) {
    const { booth } = await SearchResult({ searchParams });
    return booth;
}

async function getEventData(searchParams: { character?: string; category?: string; genre?: string; author?: string, event?: string } = {}) {
    const event = await fetchEvent({ searchParams });
    return event;
}

export default async function EventPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const booth = await getBoothData(searchParams);
    const event = await getEventData(searchParams);
    const initialBoothIds = booth.map((booth) => booth.booth_id);

    return (
        <>
            <Card className="mx-8">
                <CardHeader>
                    <CardTitle>{event?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{event?.location}</p>
                    <p>{event?.start_date} - {event?.end_date}</p>
                </CardContent>
                <CardFooter className="flex flex-col lg:flex-row gap-2">
                    {event?.homepage ? (
                        <Button asChild className="w-full lg:w-auto">
                            <Link href={event?.homepage}>
                                <Home className="w-4 h-4 mr-2" />
                                홈페이지
                            </Link>
                        </Button>
                    ) : (
                        <Button disabled className="w-full lg:w-auto">
                            <Home className="w-4 h-4 mr-2" />
                            홈페이지
                        </Button>
                    )}
                    {event?.ticketpage ? (
                        <Button asChild variant="secondary" className="w-full lg:w-auto">
                            <Link href={event?.ticketpage}>
                                <Ticket className="w-4 h-4 mr-2" />
                                입장권 구매
                            </Link>
                        </Button>
                    ) : (
                        <Button disabled variant="secondary" className="w-full lg:w-auto">
                            <Ticket className="w-4 h-4 mr-2" />
                            입장권 구매
                        </Button>
                    )}
                    {event?.map_data ? (
                        <Button asChild variant="secondary" className="w-full lg:w-auto">
                            <Link href={`/event/map?event=${event?.event_id}`}>
                                <MapIcon className="w-4 h-4 mr-2" />
                                지도
                            </Link>
                        </Button>
                    ) : (
                        <Button disabled variant="secondary" className="w-full lg:w-auto">
                            <MapIcon className="w-4 h-4 mr-2" />
                            지도
                        </Button>
                    )}
                </CardFooter>
            </Card>
            <div className="w-full flex justify-center items-center mx-auto px-8 sticky top-0 z-10 bg-background/90 py-2 backdrop-blur-md">
                <SearchBarSmall params={searchParams} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-8">
                {booth?.map((booth) => (
                    <div key={booth.booth_id}>
                        <BoothCard booth={booth} displayEvent />
                    </div>
                ))}
                <MoreBooth initialBoothIds={initialBoothIds} searchParams={searchParams} />
            </div>
        </>
    );
}