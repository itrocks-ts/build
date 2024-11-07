import fs from 'fs/promises'

const srcDir  = './src'
const destDir = '.';

(async () => {
	const files = await fs.readdir(srcDir)
	for (const file of files) {
		const srcPath  = srcDir  + '/' + file
		const destPath = destDir + '/' + file
		if (file.endsWith('.js')) {
			const content = (await fs.readFile(srcPath, 'utf8'))
				.replace(/import(.*)from\s+'..\/node_modules\/@itrocks\//g, "import$1 from '../")
				.replace(/import(.*)from\s+'..\/node_modules\//g, "import$1 from '../../")
			await fs.writeFile(destPath, content, 'utf8')
		}
		else if (file.endsWith('.d.ts')) {
			await fs.copyFile(srcPath, destPath)
		}
	}
})().catch()
