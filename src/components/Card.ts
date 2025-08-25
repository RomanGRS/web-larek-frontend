import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

interface ICard {
	title: string;
	category: string;
	image: string;
	price: number;
	text: string;
}

export class Card<T> extends Component<ICard> {
	protected _title: HTMLElement;
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	protected _price: HTMLElement;
	protected _categoryColor = <Record<string, string>>{
		'софт-скил': 'soft',
		другое: 'other',
		дополнительное: 'additional',
		кнопка: 'button',
		'хард-скил': 'hard',
	};

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._category = ensureElement<HTMLElement>(`.card__category`, container);
		this._image = ensureElement<HTMLImageElement>(`.card__image`, container);
		this._price = ensureElement<HTMLElement>(`.card__price`, container);

		if (actions?.onClick) {
			container.addEventListener('click', actions.onClick);
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
		this._category.className = `card__category card__category_${this._categoryColor[value]}`;
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set price(value: string) {
		if (value === null) {
			this.setText(this._price, `Бесценно`);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}
}

interface ICardPreview {
	text: string;
}

export class CardPreview extends Card<ICardPreview> {
	protected _text: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._button = container.querySelector(`.card__button`);
		this._text = ensureElement<HTMLElement>(`.card__text`, container);

		if (actions?.onClick) {
			if (this._button) {
				container.removeEventListener('click', actions.onClick);
				this._button.addEventListener('click', actions.onClick);
			}
		}
	}

	set text(value: string) {
		this.setText(this._text, value);
	}
}

interface ICardBasket {
	title: string;
	price: number;
	index: number;
}

export class CardBasket extends Component<ICardBasket> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLElement;
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._price = ensureElement<HTMLElement>(`.card__price`, container);
		this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
		this._button = container.querySelector(`.card__button`);

		if (actions?.onClick) {
			if (this._button) {
				container.removeEventListener('click', actions.onClick);
				this._button.addEventListener('click', actions.onClick);
			}
		}
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: string) {
		if (value === null) {
			this.setText(this._price, `Бесценно`);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}
}
