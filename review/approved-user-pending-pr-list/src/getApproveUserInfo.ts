import * as core from '@actions/core'
import * as github from '@actions/github'

async function getApproveUserInfo() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const context = github.context
    const {pull_request} = context.payload

    const {data: reviews} = await octokit.rest.pulls.listReviews({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pull_request.number,
    })

    // 승인(approve) 상태의 리뷰만 필터링
    const 전체승인목록 = reviews.filter((review) => review.state === 'APPROVED')
    return 전체승인목록[전체승인목록.length - 1].user.login
}

export default getApproveUserInfo
