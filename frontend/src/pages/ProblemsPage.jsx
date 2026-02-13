import { Link } from "react-router";
import Navbar from "../components/Navbar";

import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const problems = Object.values(PROBLEMS);

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* HEADER */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-sm md:text-base text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-3 md:space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1 w-full">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="size-10 md:size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Code2Icon className="size-5 md:size-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h2 className="text-lg md:text-xl font-bold truncate">{problem.title}</h2>
                          <span className={`badge badge-sm md:badge-md ${getDifficultyBadgeClass(problem.difficulty)} flex-shrink-0`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-base-content/60">{problem.category}</p>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-base-content/80 mb-3 line-clamp-2">{problem.description.text}</p>
                  </div>
                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 text-primary self-end sm:self-center">
                    <span className="font-medium text-sm md:text-base">Solve</span>
                    <ChevronRightIcon className="size-4 md:size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-8 md:mt-12 card bg-base-100 shadow-lg">
          <div className="card-body p-4 md:p-6">
            <div className="stats stats-vertical sm:stats-horizontal shadow-none">
              <div className="stat p-4">
                <div className="stat-title text-xs md:text-sm">Total Problems</div>
                <div className="stat-value text-primary text-2xl md:text-3xl">{problems.length}</div>
              </div>

              <div className="stat p-4">
                <div className="stat-title text-xs md:text-sm">Easy</div>
                <div className="stat-value text-success text-2xl md:text-3xl">{easyProblemsCount}</div>
              </div>
              <div className="stat p-4">
                <div className="stat-title text-xs md:text-sm">Medium</div>
                <div className="stat-value text-warning text-2xl md:text-3xl">{mediumProblemsCount}</div>
              </div>
              <div className="stat p-4">
                <div className="stat-title text-xs md:text-sm">Hard</div>
                <div className="stat-value text-error text-2xl md:text-3xl">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
