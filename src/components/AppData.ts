import {
	FormErrors,
	IAppState,
	IOrder,
	IOrderForm,
	IProductItem,
} from '../types';
import { Model } from './base/Model';

export class AppData extends Model<IAppState> {
	catalog: Product[];
	basket: Product[] = [];
	order: IOrder = {
		address: '',
		payment: 'card',
		email: '',
		total: 0,
		phone: '',
		items: [],
	};
	formErrors: FormErrors = {};
	preview: string | null;

	clearBasket() {
		this.basket = [];
		this.order.items = [];
	}

	private _total = 0;

    addToOrder(item: Product) {
        this.order.items.push(item.id);
        this._total += item.price;
    }

    removeFromOrder(item: Product) {
        const index = this.order.items.indexOf(item.id);
        if (index >= 0) {
            this.order.items.splice(index, 1);
            this._total -= item.price;
        }
    }

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: Product) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	setProductToBasket(item: Product) {
		this.basket.push(item);
	}

	removeProductToBasket(item: Product) {
		const index = this.basket.indexOf(item);
		if (index >= 0) {
			this.basket.splice(index, 1);
		}
	}

	get statusBasket(): boolean {
		return this.basket.length === 0;
	}

	get bskt(): Product[] {
		return this.basket;
	}

	set total(value: number) {
		this.order.total = value;
	}

	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}
	setContactsField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};

		if (!this.order.address) {
			errors.address = 'Необходимо указать адресс';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}

export class Product extends Model<IProductItem> {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;
}
