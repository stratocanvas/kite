export const revalidate = 86400;

export default async function Layout(props: {
    children: React.ReactNode
    AuthorAuth: React.ReactNode
    BoothProfile: React.ReactNode
    BoothProducts: React.ReactNode
    CartSummary: React.ReactNode

}) {
    return (
        <>
            <div>{props.children}</div>
            <div>{props.AuthorAuth}</div>
            <div>{props.BoothProfile}</div>
            <div>{props.BoothProducts}</div>
            <div>{props.CartSummary}</div>
        </>
    )
}

