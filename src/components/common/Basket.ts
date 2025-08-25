import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

interface IBasket {
	items: HTMLElement[];
	total: number;
	selected: string[];
}

function formatNumber(x: number, sep = ' ') {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

const formatter = new Intl.NumberFormat('ru-RU', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export class Basket extends Component<IBasket> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this.button = this.container.querySelector('.basket__button');

		// Добавляем обработчик на контейнер
		this._list.addEventListener('click', (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			// Проверяем, на какой элемент был клик
			if (target.classList.contains('basket-item')) {
				// Обработка клика по элементу корзины
				console.log('Нажали на элемент корзины');
			}
		});

		if (this.button) {
			this.button.addEventListener('click', () => {
				events.emit('order:open');
			});
		} else {
			console.warn('Кнопка заказа не найдена.');
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
		} else {
			const emptyMessage = createElement<HTMLParagraphElement>('p', {
				textContent: 'Корзина пуста',
			});
			this._list.replaceChildren(emptyMessage);
		}
	}

	set total(total: number) {
		this.setText(this._total, formatter.format(total));
	}
}
