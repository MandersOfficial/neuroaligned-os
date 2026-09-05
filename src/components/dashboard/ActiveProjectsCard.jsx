import { Link } from 'react-router-dom';
import { ArrowRight, User, Calendar } from 'lucide-react';

export default function ActiveProjectsCard({ projects }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Active Projects</p>
          <p className="text-xs text-muted-foreground mt-0.5">{projects.length} in progress</p>
        </div>
        <Link to="/projects" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-5 text-muted-foreground">
          <p className="text-sm">✨ No active projects. <Link to="/projects" className="text-primary hover:underline">Create one</Link>.</p>
        </div>
      ) : (
        <div>
          {projects.map(project => (
            <div key={project.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
              <span className="text-lg leading-none shrink-0">{project.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {project.client_name && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <User className="w-3 h-3" />{project.client_name}
                    </span>
                  )}
                  {project.due_date && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />{new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {project.priority && project.priority !== 'medium' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${project.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {project.priority}
                    </span>
                  )}
                </div>
              </div>
              <Link to="/projects" className="shrink-0 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/projects"
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-primary transition-colors font-medium text-center block"
      >
        + New project
      </Link>
    </div>
  );
}