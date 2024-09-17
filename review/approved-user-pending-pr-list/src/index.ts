import * as core from '@actions/core'
import * as github from '@actions/github'

async function main() {
    const 승인한유저 = await getApproveUser()

    // 조직의 모든 레포를 가져온다.
    const repos = await getAllRepos()

    // 승인한유저가 대기하고있는 PR 목록을 가져온다.
    const PR = await getPR(repos, 승인한유저)

    console.log('PR', JSON.stringify(PR)) // eslint-disable-line
}

async function getApproveUser() {
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

async function getPR(repos: {owner: string; name: string}[], userName: string) {
    const result = []

    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    for (const repo of repos) {
        // 대기 중인 PR 목록 가져오기
        const pulls = await octokit.rest.pulls.list({
            owner: repo.owner,
            repo: repo.name,
            state: 'open',
        })

        const 승인한유저의PR = pulls.data.filter((pr) => pr.user.login === userName)

        result.push(...승인한유저의PR.map(({title, html_url, number}) => ({title, html_url, number})))
    }

    return result
}

async function getAllRepos() {
    const result = [] as {owner: string; name: string}[]
    let page = 1

    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const ORGANIZATION_NAME = core.getInput('ORGANIZATION_NAME')

    while (true) {
        // ORGANIZATION_NAME 이 있다면 조직이 관리하는 레포를 모두 가져옵니다.
        // ORGANIZATION_NAME 값이 없다면 유저의 모든 레포를 가져옵니다.
        const repos = await octokit.rest.repos.listForOrg({
            org: ORGANIZATION_NAME,
            per_page: 100,
            page,
        })

        if (repos.data.length === 0) {
            break
        }

        result.push(
            ...repos.data.map(({owner, name}) => ({
                owner: owner.login,
                name,
            })),
        )

        page++
    }

    return result
}

main()
