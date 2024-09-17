import * as core from '@actions/core'
import * as github from '@actions/github'

async function main() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')

    const octokit = github.getOctokit(GITHUB_TOKEN)

    const context = github.context
    const {pull_request} = context.payload

    const {data: reviews} = await octokit.rest.pulls.listReviews({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pull_request.number,
    })

    console.log('reviews', JSON.stringify(reviews)) // eslint-disable-line

    // 승인(approve) 상태의 리뷰만 필터링
    const 전체승인목록 = reviews.filter((review) => review.state === 'APPROVED')
    // const 가장최신의승인 = 전체승인목록[전체승인목록.length - 1]

    console.log('가장 최신의 어프로브 유저', 전체승인목록[전체승인목록.length - 1].user.login) // eslint-disable-line

    // 조직의 모든 레포를 가져온다.
    const repos = await getAllRepos()

    console.log('repos', JSON.stringify(repos)) // eslint-disable-line

    for (const repo of repos) {
        // 대기 중인 PR 목록 가져오기
        const pulls = await octokit.rest.pulls.list({
            owner: repo.owner,
            repo: repo.name,
            state: 'open',
        })

        console.log('pulls', JSON.stringify(pulls)) // eslint-disable-line
    }
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
