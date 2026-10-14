import { FlowbaseLogo } from "./FlowbaseLogo";

export default function FlowbaseLoader() {
    return (
        <div aria-label="Loading" className="flex min-h-64 items-center justify-center bg-[#ffffff] dark:bg-[#080808] text-[#171717] dark:text-[#f5f3ee]">
            <FlowbaseLogo animate={false} enableHover={false} loader showWordmark />
        </div>
    );
}