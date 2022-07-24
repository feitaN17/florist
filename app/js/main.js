import { Swiper, Navigation } from 'swiper'
Swiper.use([Navigation])

import MicroModal from 'micromodal'
import { Fancybox } from '@fancyapps/fancybox'

document.addEventListener('DOMContentLoaded', () => {
	MicroModal.init({
		openTrigger: 'data-micromodal-open',
		closeTrigger: 'data-micromodal-close',
		disableFocus: true,
		disableScroll: true,
		awaitOpenAnimation: true,
		awaitCloseAnimation: true,
	})
	function accordion() {
		const items = document.querySelectorAll('.accordion__item-trigger')
		items.forEach((item) => {
			item.addEventListener('click', () => {
				const parent = item.parentNode
				if (parent.classList.contains('accordion__item-active')) {
					parent.classList.remove('accordion__item-active')
				} else {
					document.querySelectorAll('.accordion__item').forEach((child) => child.classList.remove('accordion__item-active'))
					parent.classList.add('accordion__item-active')
				}
			})
		})
	}
	accordion()

	const swiper = new Swiper('.swiper', {
		autoHeight: true,
		slidesPerView: 3,
		spaceBetween: 10,

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			600: {
				slidesPerView: 3,
				spaceBetween: 20,
			},
			768: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
			998: {
				slidesPerView: 4,
				spaceBetween: 40,
			},
		},
	})

	const burgerBtn = document.querySelector('.burger-btn')
	const burgerMenu = document.querySelector('.burger-menu')
	const overlay = document.querySelector('.overlay')
	burgerBtn.addEventListener('click', () => {
		if (!burgerMenu.classList.contains('burger-menu--active')) {
			document.querySelector('html').style.overflowY = 'hidden'
		} else {
			console.log(1)
			document.querySelector('html').style.overflowY = 'auto'
		}
		burgerMenu.classList.toggle('burger-menu--active')
		burgerBtn.classList.toggle('burger-btn--active')
		overlay.classList.toggle('overlay--active')
	})
	overlay.addEventListener('click', () => {
		burgerMenu.classList.remove('burger-menu--active')
		burgerBtn.classList.remove('burger-btn--active')
		overlay.classList.remove('overlay--active')
		document.querySelector('html').style.overflowY = 'auto'
	})
})
