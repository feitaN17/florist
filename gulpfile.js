let preprocessor = 'sass',
	fileswatch = 'html,htm,txt,json,md,woff,woff2'

import pkg from 'gulp'
const { gulp, src, dest, watch, parallel, series } = pkg

import browserSync from 'browser-sync'
import bssi from 'browsersync-ssi'
import ssi from 'ssi'
import fileInclude from 'gulp-file-include'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import uglify from 'gulp-uglify'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import sassglob from 'gulp-sass-glob'
const sass = gulpSass(dartSass)
import postCss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import imagemin from 'gulp-imagemin'
import concat from 'gulp-concat'
import rsync from 'gulp-rsync'
import del from 'del'

import svgSprite from 'gulp-svg-sprite'
import cheerio from 'gulp-cheerio'
import replace from 'gulp-replace'

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
			middleware: bssi({ baseDir: 'app/', ext: '.html' }),
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'hjkhjlkwdauhwdwdlul', // Attempt to use the URL https://hjkhjlkwdauhwdwdlul.loca.lt
	})
}

function scripts() {
	return src(['app/js/*.js', '!app/js/*.min.js'])
		.pipe(
			webpackStream(
				{
					mode: 'production',
					performance: { hints: false },
					plugins: [
						new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' }), // jQuery (npm i jquery)
					],
					module: {
						rules: [
							{
								test: /\.m?js$/,
								exclude: /(node_modules)/,
								use: {
									loader: 'babel-loader',
									options: {
										presets: ['@babel/preset-env'],
										plugins: ['babel-plugin-root-import'],
									},
								},
							},
						],
					},
					optimization: {
						minimize: true,
						minimizer: [
							new TerserPlugin({
								terserOptions: { format: { comments: false } },
								extractComments: false,
							}),
						],
					},
				},
				webpack
			)
		)
		.on('error', function handleError() {
			this.emit('end')
		})
		.pipe(concat('main.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src(['app/styles/**/*.*', '!app/styles/**/_*.*'])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)())
		.pipe(postCss([autoprefixer({ grid: 'autoplace' }), cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]))
		.pipe(concat('style.min.css'))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function svgSprites() {
	return src('app/images/icons/**.svg')
		.pipe(
			cheerio({
				run: function ($) {
					$('[fill]').removeAttr('fill')
					$('[stroke]').removeAttr('stroke')
					$('[style]').removeAttr('style')
				},
				parserOptions: {
					xmlMode: true,
				},
			})
		)

		.pipe(replace('&gt;', '>'))

		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: '../sprite.svg',
					},
				},
			})
		)
		.pipe(dest('app/images'))
}

const htmlInclude = () => {
	return src(['app/html/*.html']) // Находит любой .html файл в папке "html", куда будем подключать другие .html файлы
		.pipe(
			fileInclude({
				prefix: '@',
				basepath: '@file',
			})
		)
		.pipe(dest('app')) // указываем, в какую папку поместить готовый файл html
		.pipe(browserSync.stream())
}

function images() {
	return src(['app/images/**/*.*']).pipe(imagemin()).pipe(dest('dist/images')).pipe(browserSync.stream())
}

function buildcopy() {
	return src(['app/**/*.html', 'app/css/style.min.css', 'app/js/main.min.js', 'app/images/**/*.*', 'app/fonts/**/*', '!app/html/**/*.html', '!app/components/**'], {
		base: 'app/',
	}).pipe(dest('dist'))
}

async function clean() {
	del('dist/**/*', { force: true })
}

function deploy() {
	return src('dist/').pipe(
		rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [
				/* '*.htaccess' */
			], // Included files to deploy,
			exclude: ['**/Thumbs.db', '**/*.DS_Store'],
			recursive: true,
			archive: true,
			silent: false,
			compress: true,
		})
	)
}

function watching() {
	watch(['app/html/**/*.html'], { usePolling: true }, htmlInclude)
	watch(`app/styles/**/*`, { usePolling: true }, styles)
	watch(['app/js/**/*.js', '!app/js/*.min.js'], { usePolling: true }, scripts)
	watch(['app/images/icons/**.svg'], { usePolling: true }, svgSprites)
	watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload)
}

export { scripts, styles, images, htmlInclude, svgSprites, deploy }
export let assets = series(scripts, styles, images, htmlInclude, svgSprites)
export let build = series(clean, images, scripts, styles, buildcopy)
export default series(svgSprites, htmlInclude, styles, scripts, parallel(browsersync, watching))
