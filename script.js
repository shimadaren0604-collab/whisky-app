/* =====================================================
   script.js — Whisky Vault
   ウイスキー管理ツールのメインロジック

   【ファイル構成】
   1. 定数・設定
   2. 初期データ（銘柄を追加するのはここ！）
   3. DOM取得
   4. アプリ起動・初期化
   5. localStorage 読み書き
   6. 表示（テーブル描画）
   7. フィルター機能
   8. フォーム開閉
   9. 保存処理（追加・編集）
   10. 削除処理
   11. 画像プレビュー
   12. ユーティリティ
   ===================================================== */


// =====================================================
// 1. 定数・設定
// =====================================================

// localStorageに保存するデータのキー名
const STORAGE_KEY = 'whiskyVault_v1';

// ウイスキーの種類リスト（フィルターボタンとセレクトBoxに使用）
// 新しい種類を追加したい場合はここに追記してください
const WHISKY_TYPES = [
  'Single Malt',
  'Blended',
  'Bourbon',
  'Rye',
  'Irish',
  'Other',
];

// 種類ごとのバッジCSSクラス（style.css の .badge-xxx と対応）
const TYPE_BADGE_CLASS = {
  'Single Malt': 'badge-single-malt',
  'Blended':     'badge-blended',
  'Bourbon':     'badge-bourbon',
  'Rye':         'badge-rye',
  'Irish':       'badge-irish',
  'Other':       'badge-other',
};


// =====================================================
// 2. 初期ウイスキーデータ
//    ★ ここに銘柄を追加できます ★
// =====================================================

// ====== ここに初期ウイスキーを追加できます ======
//
// 【追加方法】
// 下の配列に以下の形式でオブジェクトを追加してください。
// カンマ(,)を忘れずに！
//
// {
//   id:          generateId(),          // ← そのままコピーでOK（自動でユニークIDを生成）
//   name:        '銘柄名',              // ← ウイスキーの名前
//   distillery:  '蒸留所名',            // ← 蒸留所の名前
//   country:     '国名',               // ← 生産国
//   type:        'Single Malt',        // ← WHISKY_TYPESの中から選ぶ
//   date:        '2024-01-15',         // ← 飲んだ日（YYYY-MM-DD形式 または 空文字''）
//   note:        'テイスティングメモ',   // ← 香り・味・後味など自由に
//   price:       5000,                 // ← 購入価格（円）。不明なら 0
//   image:       '',                   // ← 通常は空('')のままにする（アップロードで設定）
// },
//
// 【例】
// {
//   id: generateId(),
//   name: 'Nikka From the Barrel',
//   distillery: 'Nikka Whisky',
//   country: 'Japan',
//   type: 'Blended',
//   date: '2024-06-01',
//   note: '濃厚でスパイシー。ミニボトルで気軽に楽しめる傑作。',
//   price: 1800,
//   image: '',
// },

const DEFAULT_WHISKIES = [
  {
    id: 'init_001',
    name: '山崎 12年',
    distillery: 'サントリー　山崎',
    country: 'Japan',
    type: 'Single Malt',
    date: '2024-03-20',
    note: '甘い蜂蜜とバニラ、ほのかなスモーク。滑らかな飲み口でフィニッシュも長く続く。日本ウイスキーの代名詞的存在。',
    price: 8000,
    image: '',
  },
  {
    id: 'init_002',
    name: 'Nikka Yoichi Single Malt',
    distillery: 'Nikka Yoichi',
    country: 'Japan',
    type: 'Single Malt',
    date: '2024-05-10',
    note: '海沿いの蒸留所らしいピーティーでスモーキーな個性。力強い男性的なボディ。ロックで最高。',
    price: 6500,
    image: '',
  },
  {
    id: 'init_003',
    name: "Glenfiddich 18",
    distillery: 'Glenfiddich',
    country: 'Scotland',
    type: 'Single Malt',
    date: '2024-07-04',
    note: 'トフィー、ドライフルーツ、シェリー樽由来の複雑なリッチさ。スコッチ入門からベテランまで満足させる一本。',
    price: 12000,
    image: '',
  },
  {
    id: 'init_004',
    name: "Maker's Mark",
    distillery: "Maker's Mark Distillery",
    country: 'USA',
    type: 'Bourbon',
    date: '2024-08-15',
    note: 'バニラとキャラメルの甘さが前面に。ウィートレシピによるソフトで丸みのある飲み口。コスパ最強ボーボン。',
    price: 3500,
    image: '',
  },
  {
    id: 'init_005',
    name: "Jameson Irish Whiskey",
    distillery: 'Midleton Distillery',
    country: 'Ireland',
    type: 'Irish',
    date: '2024-09-01',
    note: '軽くてクリーン。なめらかでほのかにフルーティー。食前酒として最適。ハイボールでも美味しい。',
    price: 2500,
    image: '',
  },
];
// ====== 初期ウイスキーここまで ======


// =====================================================
// 3. DOM要素の取得
// =====================================================
// ※ HTML内のid属性と対応しています

const whiskyBody     = document.getElementById('whiskyBody');     // テーブルのtbody
const emptyState     = document.getElementById('emptyState');     // 空状態メッセージ
const filterButtons  = document.getElementById('filterButtons');  // フィルターボタン群
const totalCountEl   = document.getElementById('totalCount');     // ヘッダー：件数
const totalSpentEl   = document.getElementById('totalSpent');     // ヘッダー：合計金額
const modalOverlay   = document.getElementById('modalOverlay');   // 追加・編集モーダル
const deleteOverlay  = document.getElementById('deleteOverlay');  // 削除確認モーダル
const whiskyForm     = document.getElementById('whiskyForm');     // フォーム
const modalTitle     = document.getElementById('modalTitle');     // モーダルのタイトル
const btnOpenForm    = document.getElementById('btnOpenForm');    // 「Add Whisky」ボタン
const btnCloseForm   = document.getElementById('btnCloseForm');   // モーダル閉じるボタン
const btnCancel      = document.getElementById('btnCancel');      // キャンセルボタン
const editIdField    = document.getElementById('editId');         // 隠し：編集中のID
const btnCancelDel   = document.getElementById('btnCancelDelete'); // 削除モーダルのx
const btnCancelDel2  = document.getElementById('btnCancelDelete2');
const btnConfirmDel  = document.getElementById('btnConfirmDelete');
const fimage         = document.getElementById('fimage');         // 画像ファイル入力
const imagePreview   = document.getElementById('imagePreview');   // 画像プレビュー
const uploadPlaceholder = document.getElementById('uploadPlaceholder');


// =====================================================
// 4. アプリ起動・初期化
// =====================================================

// アプリの状態管理変数
let whiskies      = [];        // 現在のウイスキーデータ配列
let currentFilter = 'all';     // 現在のフィルター（'all' または種類名）
let deleteTargetId = null;     // 削除対象のID（確認モーダル用）
let editingImageBase64 = '';   // 現在フォームに表示中の画像データ

/**
 * アプリの初期化処理
 * ページ読み込み時に1回だけ実行される
 */
function init() {
  // セレクトボックスとフィルターボタンを種類リストから生成
  buildTypeSelect();
  buildFilterButtons();

  // localStorageからデータを読み込む
  whiskies = loadFromStorage();

  // データが空（初回起動）なら初期データを保存
  if (whiskies.length === 0) {
    whiskies = DEFAULT_WHISKIES;
    saveToStorage(whiskies);
  }

  // テーブルを描画
  renderTable(whiskies);

  // イベントリスナーを設定
  setupEventListeners();
}

// ページ読み込み完了後に初期化を実行
window.addEventListener('DOMContentLoaded', init);


// =====================================================
// 5. localStorage 読み書き
// =====================================================

/**
 * localStorageにデータを保存する
 * @param {Array} data - ウイスキーデータの配列
 */
function saveToStorage(data) {
  try {
    // オブジェクト配列をJSON文字列に変換して保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // 画像データが大きすぎる場合などにエラーになることがある
    alert('保存に失敗しました。画像が大きすぎる可能性があります。');
    console.error('localStorage保存エラー:', e);
  }
}

/**
 * localStorageからデータを読み込む
 * @returns {Array} ウイスキーデータの配列（なければ空配列）
 */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];        // データがなければ空配列を返す
  try {
    return JSON.parse(raw);   // JSON文字列をオブジェクト配列に変換
  } catch (e) {
    console.error('データの読み込みに失敗しました:', e);
    return [];
  }
}


// =====================================================
// 6. 表示（テーブル描画）
// =====================================================

/**
 * ウイスキー配列をテーブルに描画する
 * @param {Array} list - 表示するウイスキーの配列
 */
function renderTable(list) {
  whiskyBody.innerHTML = ''; // 一度テーブルをクリア

  if (list.length === 0) {
    // データがない場合は空状態メッセージを表示
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    // 各ウイスキーの行を生成して追加
    list.forEach(w => {
      whiskyBody.appendChild(createRow(w));
    });
  }

  // ヘッダーの統計情報を更新（全件数・全費用）
  updateStats();
}

/**
 * 1件分のテーブル行（<tr>）を生成する
 * @param {Object} w - ウイスキーデータ
 * @returns {HTMLElement} <tr>要素
 */
function createRow(w) {
  const tr = document.createElement('tr');

  // 画像セル
  let imgHtml;
  if (w.image) {
    // 画像データがある場合
    imgHtml = `<img class="table-img" src="${w.image}" alt="${escapeHtml(w.name)}" />`;
  } else {
    // ない場合はプレースホルダー
    imgHtml = `<div class="table-img-placeholder">🥃</div>`;
  }

  // 種類バッジのCSSクラスを取得（未定義の場合はOther）
  const badgeClass = TYPE_BADGE_CLASS[w.type] || 'badge-other';

  // 価格の表示（0の場合は「—」）
  const priceText = w.price ? `¥${Number(w.price).toLocaleString()}` : '—';

  // 日付の表示（空の場合は「—」）
  const dateText = w.date ? formatDate(w.date) : '—';

  // メモが長い場合は省略（テーブルでは短く表示）
  const noteText = w.note ? escapeHtml(w.note) : '—';

  tr.innerHTML =`
    <td class="col-img" data-label="画像">${imgHtml}</td>
    <td class="col-name" data-label="銘柄名">${escapeHtml(w.name)}</td>
    <td data-label="蒸留所">${escapeHtml(w.distillery || '—')}</td>
    <td data-label="国">${escapeHtml(w.country || '—')}</td>
    <td data-label="種類"><span class="type-badge ${badgeClass}">${escapeHtml(w.type)}</span></td>
    <td data-label="飲んだ日">${dateText}</td>
    <td class="col-price" data-label="購入価格">${priceText}</td>
    <td class="col-note" data-label="メモ" title="${escapeHtml(w.note || '')}">${noteText}</td>
    <td class="col-actions" data-label="操作">
      <button class="btn-edit"   data-id="${w.id}">編集</button>
      <button class="btn-delete" data-id="${w.id}">削除</button>
    </td>
  `;

  // 編集ボタンにイベント追加
  tr.querySelector('.btn-edit').addEventListener('click', () => openEditModal(w.id));

  // 削除ボタンにイベント追加
  tr.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(w.id));

  return tr;
}

/**
 * ヘッダーの統計情報（件数・合計金額）を更新する
 */
function updateStats() {
  // 全件数
  totalCountEl.textContent = whiskies.length;

  // 合計金額（priceが数値のものだけを合計）
  const total = whiskies.reduce((sum, w) => sum + (Number(w.price) || 0), 0);
  totalSpentEl.textContent = `¥${total.toLocaleString()}`;
}


// =====================================================
// 7. フィルター機能
// =====================================================

/**
 * フィルターボタンを動的に生成する
 * WHISKY_TYPES配列の内容からボタンを作る
 */
function buildFilterButtons() {
  // 「All」ボタンはHTMLに既にあるので、種類ボタンだけ追加
  WHISKY_TYPES.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = type;
    btn.textContent = type;

    btn.addEventListener('click', () => {
      setFilter(type);
    });

    filterButtons.appendChild(btn);
  });

  // 「All」ボタンにもイベント追加
  document.querySelector('.filter-btn[data-filter="all"]')
    .addEventListener('click', () => setFilter('all'));
}

/**
 * フィルターを変更してテーブルを再描画する
 * @param {string} filterValue - 'all' または種類名
 */
function setFilter(filterValue) {
  currentFilter = filterValue;

  // ボタンのactiveクラスを更新
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterValue);
  });

  // フィルタリングして表示
  if (filterValue === 'all') {
    renderTable(whiskies);
  } else {
    const filtered = whiskies.filter(w => w.type === filterValue);
    renderTable(filtered);
  }
}


// =====================================================
// 8. フォーム開閉
// =====================================================

/**
 * セレクトボックスの選択肢をWHISKY_TYPESから生成する
 */
function buildTypeSelect() {
  const select = document.getElementById('ftype');
  WHISKY_TYPES.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });
}

/**
 * 追加モーダルを開く（フォームを空にリセット）
 */
function openAddModal() {
  modalTitle.textContent = 'Add New Whisky';
  whiskyForm.reset();            // フォームをクリア
  editIdField.value = '';        // 編集IDを空に（新規追加モード）
  editingImageBase64 = '';       // 画像データをクリア
  resetImagePreview();           // プレビューをリセット
  modalOverlay.classList.add('open');
}

/**
 * 編集モーダルを開く（選択したウイスキーのデータをフォームに入れる）
 * @param {string} id - 編集するウイスキーのID
 */
function openEditModal(id) {
  const w = whiskies.find(x => x.id === id);
  if (!w) return;

  modalTitle.textContent = 'Edit Whisky';
  editIdField.value = id;

  // フォームに既存データをセット
  document.getElementById('fname').value       = w.name        || '';
  document.getElementById('fdistillery').value = w.distillery  || '';
  document.getElementById('fcountry').value    = w.country     || '';
  document.getElementById('ftype').value       = w.type        || WHISKY_TYPES[0];
  document.getElementById('fdate').value       = w.date        || '';
  document.getElementById('fprice').value      = w.price       || '';
  document.getElementById('fnote').value       = w.note        || '';

  // 既存画像をプレビュー
  editingImageBase64 = w.image || '';
  if (w.image) {
    imagePreview.src = w.image;
    imagePreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  } else {
    resetImagePreview();
  }

  modalOverlay.classList.add('open');
}

/**
 * 追加・編集モーダルを閉じる
 */
function closeModal() {
  modalOverlay.classList.remove('open');
}

/**
 * 削除確認モーダルを開く
 * @param {string} id - 削除するウイスキーのID
 */
function openDeleteModal(id) {
  deleteTargetId = id;
  deleteOverlay.classList.add('open');
}

/**
 * 削除確認モーダルを閉じる
 */
function closeDeleteModal() {
  deleteOverlay.classList.remove('open');
  deleteTargetId = null;
}

/**
 * 画像プレビューをリセット（プレースホルダー表示に戻す）
 */
function resetImagePreview() {
  imagePreview.src = '';
  imagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'flex';
}


// =====================================================
// 9. 保存処理（追加・編集）
// =====================================================

/**
 * フォームの送信処理（追加 or 編集）
 * @param {Event} e - submitイベント
 */
function handleFormSubmit(e) {
  e.preventDefault(); // ページのリロードを防ぐ

  // フォームの値を取得
  const name       = document.getElementById('fname').value.trim();
  const distillery = document.getElementById('fdistillery').value.trim();
  const country    = document.getElementById('fcountry').value.trim();
  const type       = document.getElementById('ftype').value;
  const date       = document.getElementById('fdate').value;
  const price      = Number(document.getElementById('fprice').value) || 0;
  const note       = document.getElementById('fnote').value.trim();
  const id         = editIdField.value;

  // バリデーション（名前と種類は必須）
  if (!name) {
    alert('銘柄名を入力してください。');
    return;
  }

  // 画像は FileReader で読み込んだ Base64 データを使用
  const image = editingImageBase64;

  if (id) {
    // ===== 編集モード =====
    const index = whiskies.findIndex(w => w.id === id);
    if (index !== -1) {
      whiskies[index] = { id, name, distillery, country, type, date, price, note, image };
    }
  } else {
    // ===== 新規追加モード =====
    const newWhisky = {
      id: generateId(), // ユニークIDを自動生成
      name, distillery, country, type, date, price, note, image,
    };
    whiskies.push(newWhisky);
  }

  // localStorageに保存
  saveToStorage(whiskies);

  // テーブルを再描画（現在のフィルターを維持）
  setFilter(currentFilter);

  // モーダルを閉じる
  closeModal();
}


// =====================================================
// 10. 削除処理
// =====================================================

/**
 * 削除を実行する
 */
function handleDelete() {
  if (!deleteTargetId) return;

  // 対象IDのウイスキーを配列から削除
  whiskies = whiskies.filter(w => w.id !== deleteTargetId);

  // localStorageに保存
  saveToStorage(whiskies);

  // テーブルを再描画（現在のフィルターを維持）
  setFilter(currentFilter);

  // 削除モーダルを閉じる
  closeDeleteModal();
}


// =====================================================
// 11. 画像プレビュー処理
// =====================================================

/**
 * 画像ファイルが選択されたとき、プレビューを表示する
 * FileReader API を使ってローカルファイルを読み込む
 * @param {Event} e - changeイベント
 */
function handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  // FileReader でファイルをBase64エンコードして読み込む
  const reader = new FileReader();

  reader.onload = function(event) {
    // 読み込み完了後、プレビューとデータを更新
    editingImageBase64 = event.target.result; // Base64文字列を保持
    imagePreview.src = editingImageBase64;
    imagePreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  };

  // ファイルをData URL（Base64）として読み込む開始
  reader.readAsDataURL(file);
}


// =====================================================
// 12. イベントリスナーのまとめて設定
// =====================================================

/**
 * 各種イベントリスナーをまとめて登録する
 */
function setupEventListeners() {
  // 「Add Whisky」ボタン
  btnOpenForm.addEventListener('click', openAddModal);

  // モーダルの閉じるボタン・キャンセルボタン
  btnCloseForm.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  // モーダル外をクリックで閉じる
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // フォームの送信（保存ボタン）
  whiskyForm.addEventListener('submit', handleFormSubmit);

  // 削除確認モーダルのボタン
  btnCancelDel.addEventListener('click',  closeDeleteModal);
  btnCancelDel2.addEventListener('click', closeDeleteModal);
  btnConfirmDel.addEventListener('click', handleDelete);

  // 削除モーダル外クリックで閉じる
  deleteOverlay.addEventListener('click', (e) => {
    if (e.target === deleteOverlay) closeDeleteModal();
  });

  // 画像ファイル選択
  fimage.addEventListener('change', handleImageChange);
}


// =====================================================
// 13. ユーティリティ関数
// =====================================================

/**
 * ユニークなIDを生成する
 * タイムスタンプ＋乱数の組み合わせ
 * @returns {string} ユニークID文字列
 */
function generateId() {
  return `w_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * YYYY-MM-DD形式の日付を読みやすい形式に変換する
 * 例: '2024-03-20' → '2024/03/20'
 * @param {string} dateStr - 日付文字列
 * @returns {string} 表示用日付
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return dateStr.replace(/-/g, '/');
}

/**
 * XSS対策：HTMLの特殊文字をエスケープする
 * innerHTML に外部データを入れるときは必ずこれを通す
 * @param {string} str - エスケープする文字列
 * @returns {string} 安全な文字列
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
