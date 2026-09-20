import { WorkOrbitLogo } from "./WorkOrbitLogo";

export default function WorkOrbitLoader() {
    return (
        <div aria-label="Loading" className="flex min-h-64 items-center justify-center bg-[#ffffff] dark:bg-[#080808] text-[#171717] dark:text-[#f5f3ee]">
            <WorkOrbitLogo animate={false} enableHover={false} loader showWordmark />
        </div>
    );
}
