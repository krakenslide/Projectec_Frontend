import { ProjectecLogo } from "./ProjectecLogo";

export default function ProjectecLoader() {
    return (
        <div aria-label="Loading" className="flex min-h-64 items-center justify-center bg-[#080808] text-[#f0ede6]">
            <ProjectecLogo animate={false} enableHover={false} loader showWordmark />
        </div>
    );
}