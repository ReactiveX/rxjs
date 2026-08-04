const conventionalTitle =
  /^(?<type>feat|fix|perf|revert|docs|chore|refactor|test|build|ci|style)(?:\([^)\r\n]+\))?(?<breaking>!)?: (?<description>\S.*)$/;

export function validateConventionalTitle(title) {
  const match = conventionalTitle.exec(title);
  if (!match?.groups) throw new Error('Title is not a supported Conventional Commit.');
  return {
    breaking: match.groups.breaking === '!',
    description: match.groups.description,
    type: match.groups.type,
  };
}
