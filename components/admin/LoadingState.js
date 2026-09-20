export default function LoadingState({ text = "Loading..." }) {
    return (
        <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-orange-500" />
                {text}
            </div>
        </div>
    );
}