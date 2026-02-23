import { useMemo } from "react";

/**
 * Returns access flags for a project given the current user.
 * - isOwner: user created the project (owner_id == user.id)
 * - isCollaborator: user is in project.collaborators array
 * - canAccess: owner OR collaborator
 * - canEdit: owner OR collaborator
 * - canDelete: owner only
 * - canManageCollaborators: owner only
 */
export function useProjectAccess(project, user) {
  return useMemo(() => {
    if (!project || !user) return { canAccess: false, isOwner: false, isCollaborator: false, canEdit: false, canDelete: false, canManageCollaborators: false };

    const isOwner = project.owner_id === user.id || project.created_by === user.email;
    const collaborators = project.collaborators || [];
    const isCollaborator = collaborators.includes(user.id) || collaborators.includes(user.email);
    const canAccess = isOwner || isCollaborator;

    return {
      isOwner,
      isCollaborator,
      canAccess,
      canEdit: canAccess,
      canDelete: isOwner,
      canManageCollaborators: isOwner,
    };
  }, [project, user]);
}

/**
 * Filter a list of projects to only those accessible by the user.
 */
export function filterAccessibleProjects(projects, user) {
  if (!user) return [];
  return projects.filter((p) => {
    const isOwner = p.owner_id === user.id || p.created_by === user.email;
    const collaborators = p.collaborators || [];
    const isCollaborator = collaborators.includes(user.id) || collaborators.includes(user.email);
    return isOwner || isCollaborator;
  });
}