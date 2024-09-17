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
    const approvers = reviews.filter((review) => review.state === 'APPROVED')

    console.log('approvers', JSON.stringify(approvers)) // eslint-disable-line

    const approversIDS = approvers.map((review) => review.user.login)

    console.log('approversIDS', JSON.stringify(approversIDS)) // eslint-disable-line

    const repos = await getAllRepos(approversIDS[0])

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

async function getAllRepos(userName: string) {
    const result = [] as {owner: string; name: string}[]
    let page = 1

    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const ORGANIZATION_NAME = core.getInput('ORGANIZATION_NAME')

    while (true) {
        // ORGANIZATION_NAME 이 있다면 조직이 관리하는 레포를 모두 가져옵니다.
        // ORGANIZATION_NAME 값이 없다면 유저의 모든 레포를 가져옵니다.
        const repos =
            ORGANIZATION_NAME != null
                ? await octokit.rest.repos.listForOrg({
                      org: 'organization-name',
                      per_page: 100,
                      page,
                  })
                : await octokit.rest.repos.listForUser({
                      username: userName,
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
