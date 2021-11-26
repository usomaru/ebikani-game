// Step1 キーボードによる操作を実装してみる。

// canvas要素の取得
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");

// 進むスピード ここを変更すると、キャラクターの速度を変えられる
const speed = 2;

// 画像の高さ分
const imageHeight = 32;

// キーボードの入力状態を記録
var inputKeys = new Array();

// キャラクターの画像を表示する座標の定義
var characterImageX = 0;
var characterImageY = 400;

// 上下方向の速度
var characterImageVY = 0;
// ジャンプしたか否かのフラグ値
var isJump = false;

// 右向きかどうか
var toRight = true;

// ロード処理
window.addEventListener("load", init);


// 初期化
function init() {
    // 画面全体をクリア
    ctx.clearRect(0, 0, 840, 530);
    characterImageX = 0;
    characterImageY = 400
    characterImageVY = 0;
    isJump = false;
    toRight = true;
    update();
}

// 画面の更新(繰り返し実行される)
function update() {
    // 画面全体をクリア
    ctx.clearRect(0, 0, 840, 530);

    // 更新後の座標
    var updatedImageX = characterImageX;
    var updatedImageY = characterImageY;

    updatedImageX = putKey(updatedImageX);

    if (isJump) {
        updatedImageY = jump(updatedImageY);
    }

    // 入力されたキーイベントの座標を反映
    characterImageX = updatedImageX;
    characterImageY = updatedImageY;

    displayImages();
    // 再描画
    window.requestAnimationFrame(update);
}

// 画像の表示
function displayImages() {
    // キャラクターの画像を表示
    var characterImage = new Image();
    characterImage.src = "../images/character-01/ebi-rbarse.png"
    ctx.drawImage(characterImage, characterImageX, characterImageY, 32, imageHeight);
}

// キーボードの入力イベントをトリガーに配列のフラグ値を更新させる
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
    e.preventDefault();
    inputKeys[e.keyCode] = true;
}

window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
    e.preventDefault();
    inputKeys[e.keyCode] = false;
}

// 入力キーの反映 ステップ1ではここを追加してもらう
// 右左の操作ができるようになった後に、ジャンプを実装してもらう
// 各ボタンが配列の何に当たるかも教えてアレンジしてほしい(32はスペースキーとか)
function putKey(updatedImageX) {

    // ←
    if (inputKeys[37]) {
        toRight = false;
        updatedImageX = characterImageX - speed;
    }

    // →
    if (inputKeys[39]) {
        toRight = true;
        updatedImageX = characterImageX + speed;
    }

    // ↑ (ジャンプ)
    if ((inputKeys[38]) && !isJump) {
        characterImageVY = -10;
        isJump = true;
    }

    // 入力されたキーイベントの座標を返却
    return updatedImageX
}

// ジャンプしたときの処理
function jump(updatedImageY) {
    // 速度分追加
    updatedImageY = characterImageY + characterImageVY;

    // 落下速度を出す
    characterImageVY = characterImageVY + 0.5;

    // 着地処理　imageHeight→画像のサイズ 432→着地してほしいY座標
    if (updatedImageY + imageHeight > 432) {
        updatedImageY = 432 - imageHeight;
        isJump = false;
    }

    return updatedImageY;

}