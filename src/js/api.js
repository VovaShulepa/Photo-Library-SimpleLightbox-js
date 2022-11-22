'use strict';

import axios from 'axios';

export class Api {
  #URL = 'https://pixabay.com/api/';
  #API_KEY = '31531942-1a396f823c92ef072098f1223';

  constructor() {
    this.page = 1;
    this.totalHits = null;
    this.query = null;
    this.per_page = 40;
  }

  fetchPhotosByQuery() {
    const searchParams = new URLSearchParams({
      page: this.page,
      per_page: this.per_page,

      key: this.#API_KEY,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    });
    return axios.get(`${this.#URL}/?${searchParams}`);
  }

  isNextDataExist() {
    return this.page * this.per_page < this.totalHits;
  }
}
