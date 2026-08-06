export function MeshBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
            <div className="absolute -top-64 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[160px] dark:bg-primary/12" />
            <div className="absolute top-1/3 -right-40 h-[460px] w-[460px] rounded-full bg-violet-500/10 blur-[140px] dark:bg-violet-500/14" />
            <div className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full bg-sky-500/8 blur-[140px] dark:bg-sky-400/10" />
        </div>
    );
}
