import { ProjectecLogo } from "./ProjectecLogo";

export default function ProjectecLoader() {
    return (
        <div aria-label="Loading" className="flex min-h-64 items-center justify-center bg-[#ffffff] dark:bg-[#080808] text-[#171717] dark:text-[#f5f3ee]">
            <ProjectecLogo animate={false} enableHover={false} loader showWordmark />
        </div>
    );
}