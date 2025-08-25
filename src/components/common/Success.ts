import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface ISuccess {
	total: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLElement;
	protected _total: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);
		console.log('Конструктор Success вызван', this.container);

		this._close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		this._total = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);

		if (!this._close || !this._total) {
			console.warn('Один или несколько элементов не найдены.');
		}

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}
	set total(value: string) {
		this._total.textContent = `Списано ${value} синапсов`;
	}
}
