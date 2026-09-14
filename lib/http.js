const axios = require('axios')
axios.interceptors.response.use(res => {
    return res.data
})
async function getRepoList(){
	const base = 'https://gitee.com/api/v5/users/rawcloud/repos'
	const params = 'type=all&sort=full_name&direction=asc&per_page=100'
	const all = []
	let page = 1
	while (true) {
		const list = await axios.get(`${base}?${params}&page=${page}`)
		if (!Array.isArray(list) || list.length === 0) break
		all.push(...list)
		if (list.length < 100) break
		page += 1
	}
	return all
}
module.exports = {
    getRepoList
}
