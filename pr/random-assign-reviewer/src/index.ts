import * as core from '@actions/core'
import * as github from '@actions/github'

async function main() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)
    const context = github.context
    const {pull_request} = context.payload

    const ORGANIZATION_NAME = core.getInput('ORGANIZATION_NAME')
    const ASSIGN_COUNT = core.getInput('ASSIGN_COUNT')

    const PR생성자 = pull_request.user.login as string

    // organization의 멤버 리스트 가져오기
    const members = await octokit.rest.orgs.listMembers({
        org: ORGANIZATION_NAME,
    })

    // PR을 생성한 유저의 정보는 제거한다.
    const orgMemberNames = members.data.filter(({login}) => PR생성자 !== login).map(({login}) => login)

    // PR에 리뷰어 어사인
    await octokit.rest.pulls.requestReviewers({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pull_request.number,
        reviewers: shuffledAndSlice(orgMemberNames, Number(ASSIGN_COUNT)),
    })
}

function shuffledAndSlice(members: string[], count: number) {
    const shuffled = members.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

main()
