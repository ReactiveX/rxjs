# Maintainer Guidelines

These are guidelines for maintainers of this repository as (mostly) [gifted to us by](https://github.com/ReactiveX/RxJS/issues/121#issue-97747542)
His Beardliness, @jeffbcross. They are words to live by for those that are tasked with reviewing and merging pull requests and otherwise
shepherding the community. As the roster of trusted maintainers grows, we'll expect these guidelines to stay pretty
much the same (but suggestions are always welcome).


### The ~~10~~ 6 Commandments
 
 * __[Code of Conduct](../CODE_OF_CONDUCT.md)__. We should be setting a good example and be welcoming to all. We should be listening
 to all feedback from everyone in our community and respect their viewpoints and opinions.
 * __Be sure PRs meet [Contribution Guidelines](../CONTRIBUTING.md)__. It's important we keep our code base 
 and repository consistent. The best way to do this is to know and enforce the contribution guidelines.
 * __Clean, flat commit history__. We never click the green merge button on PRs, but instead we pull down 
 the PR branch and rebase it against master then replace master with the PR branch. See 
 [example gist](https://gist.github.com/jeffbcross/307c6da45d26e29030ef). This reduces noise in the commit 
 history, removing all of the merge commits, and keeps history flat. The flat history is beneficial 
 to tools/scripts that analyze commit ancestry.
 * __Always green master__. Failing master builds tend to cascade into other broken builds, and 
 frustration among other contributors who have rebased against a broken master. Much of our deployment 
 and other infrastructure is based on the assumption that master is always green, nothing should be
 merged before Travis has confirmed that a PR is green, even for seemingly insignificant changes. 
 Nothing should be merged into a red master, and whomever broke it should drop everything and fix it 
 right away. Fixes should be submitted as a PR and verified as green instead of immediately merging 
 to master.
 * __No force pushes to master__. Only in rare circumstances should a force push to master be made, 
 and other maintainers should be notified beforehand. The most common situation for a justified force 
 push is when a commit has been pushed with an invalid message. The force push should be made as soon 
 as possible to reduce side effects.
 * __Small, logical commits__. A PR should be focused on a single problem, though that problem may be
 reasonable to be broken into a few logical commits. For example, a global renaming may be best to be 
 broken into a single commit that renames all files, and then a commit that renames symbols within files. 
 This makes the review process simpler easier, so the diff of the meaty commit (where symbols are 
 renamed) can be easily understood than if both were done in the same commit, in which case github would 
 just show a deleted file and an added file.
