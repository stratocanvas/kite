import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.
import { GetOgData } from "../../../booth/[id]/fetch";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const url = new URL(request.url);
    const path = url.pathname;
    const id = path.split('/').pop();
    try {
        const booth = await GetOgData(id)
        const title = booth?.name
        const event = booth?.event.name
        const genre = booth?.genre.map((genre) => genre.name).join(' ')
        const bgcolor = booth?.thumbnail ? `#${booth.thumbnail.split('-c(')[1].split(')')[0]}` : '#797979'
        const date = Array.isArray(booth?.date) && booth?.date.length === 2
            ? "양일"
            : new Date(booth?.date).toLocaleDateString("ko-KR", {
                weekday: "long",
            })

        const sortedLocations = booth?.locations?.sort((a: string, b: string) => a.localeCompare(b)) || [];
        const locationDisplay = (() => {
            if (sortedLocations.length === 0) {
                return "위치 미정";
            }
            if (sortedLocations.length > 1) {
                return `${sortedLocations[0]}-${sortedLocations[sortedLocations.length - 1].match(/\d+$/)[0]}`;
            }
            return sortedLocations[0];
        })();

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: bgcolor,
                    }}
                >
                    <div tw="flex px-12">
                        <div tw="flex flex-col w-full py-12 px-12 items-left justify-start p-8">
                            <p tw="flex flex-col text-4xl tracking-tight -mb-1 text-white/70 text-left">
                                {event}
                            </p>
                            <h2 tw="flex flex-col text-[130px] tracking-tight text-white text-left">
                                {title}
                            </h2>
                            <p tw="flex flex-col text-3xl font-regular tracking-tight text-white/70 text-left">
                                {locationDisplay} · {date}
                            </p>
                            <p tw="flex flex-col text-3xl -mt-3 font-regular tracking-tight text-white/70 text-left">
                                {genre}
                            </p>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,

            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}