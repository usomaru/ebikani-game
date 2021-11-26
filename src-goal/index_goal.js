// canvas要素の取得
const canvas = document.getElementById("maincanvas");
const ctx = canvas.getContext("2d");

// 進むスピード ここを変更すると、キャラクターの速度を変えられる
const speed = 2;

// 画像の高さ分
const imageHeight = 32;

// 音楽の取得
const music = new Audio();

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

// 地面要素の定義
var grounds = [];

// 敵の情報のパラメータ宣言
var enemies = [];

// ゲームオーバーかどうかを判断するフラグ
var isGameOver = false;

// ロード処理
window.addEventListener("load", init);


// 初期化
function init() {
  // 画面全体をクリア
  ctx.clearRect(0, 0, 840, 530);
  characterImageX = 0;
  characterImageY = 400;
  characterImageVY = 0;
  isJump = false;
  toRight = true;
  // Step2で追加
  grounds = [
    { x: 0, y: 432, w: 200, h: 32 },
    { x: 200, y: 332, w: 150, h: 32 },
    { x: 350, y: 232, w: 250, h: 32 },
    { x: 600, y: 132, w: 200, h: 32 }
  ];
  enemies = [
    { x: 528, y: 0, isJump: true, vy: 0 },
    { x: 750, y: 0, isJump: true, vy: 0 },
    { x: 300, y: 180, isJump: true, vy: 0 }
  ];
  isGameOver = false;
}

// 音楽を鳴らしたい場合に使用
// スタートボタン押下
function play() {
  music.src = '../musics/sanjinooyatsu.mp3';
  music.preload = "auto";
  music.currentTime = 0;
  music.play();
  update()
}

// 画面の更新(繰り返し実行される)
function update() {
  // 画面全体をクリア
  ctx.clearRect(0, 0, 840, 530);

  // Step2で追加
  // 敵に関する処理
  // 敵の数ぶん、ループを回して敵を動かす処理をする
  for (var i = 0; i < enemies.length; i++) {
    var updatedEnemyX = enemies[i].x;
    var updatedEnemyY = enemies[i].y;
    var updatedEnemyVY = enemies[i].vy;
    var updatedEnmeyIsJump = enemies[i].isJump;

    // 敵は左に固定の速度で移動
    updatedEnemyX = updatedEnemyX - 1;

    if (updatedEnmeyIsJump) {
      const [fallingPositionY, fallingPositionVY, isJumpEnemy] =
        falling(
          enemies[i].x,
          enemies[i].y,
          enemies[i].vy,
          updatedEnemyX,
          updatedEnemyY
        );
      updatedEnemyY = fallingPositionY;
      updatedEnemyVY = fallingPositionVY;
      updatedEnmeyIsJump = isJumpEnemy;
    } else {
      if (getPositionGroundWithCharacter(enemies[i].x, enemies[i].y, updatedEnemyX, updatedEnemyY) === null) {
        updatedEnmeyIsJump = true;
        updatedEnemyVY = 0;
      }
    }
    enemies[i].x = updatedEnemyX;
    enemies[i].y = updatedEnemyY;
    enemies[i].vy = updatedEnemyVY;
    enemies[i].isJump = updatedEnmeyIsJump;
  }

  // 動かすキャラクターに関する処理
  // 更新後の座標
  var updatedImageX = characterImageX;
  var updatedImageY = characterImageY;

  // Step3追加　ゲームオーバー判定
  if (isGameOver) {
    // ゲームオーバーしたときの挙動
    updatedImageY = characterImageY + characterImageVY;
    characterImageVY = characterImageVY + 0.5;
    if (updatedImageY > 530) {
      music.pause();
      alert("Game Over");
      init();
      return;
    }
  } else {
    updatedImageX = putKey(updatedImageX);
  }

  if (isJump) {
    const [fallingPositionY, fallingPositionVY, isJumpChara] =
      falling(
        characterImageX,
        characterImageY,
        characterImageVY,
        updatedImageX,
        updatedImageY
      );
    updatedImageY = fallingPositionY;
    characterImageVY = fallingPositionVY;
    isJump = isJumpChara;
  } else {
    // ブロックの上にいなければジャンプ中の扱いとして初期速度0で落下するようにする
    if (getPositionGroundWithCharacter(characterImageX, characterImageY, updatedImageX, updatedImageY) === null) {
      isJump = true;
      characterImageVY = 0;
    }
  }

  // Step3で追加
  // 下まで落ちたらゲームオーバーとする
  if (characterImageY > 530) {
    isGameOver = true;
    updatedImageY = 530;
    characterImageVY = -20;
  }

  // 入力されたキーイベントの座標を反映
  characterImageX = updatedImageX;
  characterImageY = updatedImageY;

  // Step3で追加
  // この時点でまだゲームオーバーでなかったら、あたり判定を行う
  if (!isGameOver) {

    // 敵情報ごとに当たり判定を行う必要があるので、ループ
    for (var i = 0; i < enemies.length; i++) {
      var isHit = isAreaOverlap(
        updatedImageX,
        updatedImageY,
        32,
        imageHeight,
        enemies[i].x,
        enemies[i].y,
        32,
        imageHeight
      );

      // ジャンプして踏みつぶしたら、敵が消せる
      if (isHit) {
        if (isJump && characterImageVY > 0) {
          // ジャンプしていて、落下している状態で敵にぶつかった場合には
          // 敵を消し去る(見えない位置に移動させる)とともに、上向きにジャンプさせる
          characterImageVY = -7;
          enemies[i].y = 530;
        } else {
          // ぶつかっていた場合にはゲームオーバーとし、上方向の初速度を与える
          isGameOver = true;
          characterImageVY = -10;
        }
      }
    }
  }

  // Step3で追加
  // ゴールを作る
  if (!isGameOver) {
    var isHitGoal = isAreaOverlap(
      updatedImageX,
      updatedImageY,
      32,
      imageHeight,
      760,
      100,
      32,
      imageHeight
    );
    if (isHitGoal) {
      music.pause();
      alert("GOAL");
      init();
      return;
    }
  }

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

  // Step2で追加
  // 地面の画像を表示
  var groundImage = new Image();
  groundImage.src = "../images/ground-01/base.png";
  // ループすることで、上で定義した数ぶんの地面を表示できる
  for (var i = 0; i < grounds.length; i++) {
    ctx.drawImage(groundImage, grounds[i].x, grounds[i].y, grounds[i].w, grounds[i].h);
  }

  // Step2で追加
  // 敵の画像を表示
  var enemyImage = new Image();
  enemyImage.src = "../images/character-02/kani_enemy.png";
  // ループすることで、上で定義した数ぶんの敵を表示できる
  for (var i = 0; i < enemies.length; i++) {
    ctx.drawImage(enemyImage, enemies[i].x, enemies[i].y, 32, imageHeight);
  }

  // step3で追加
  // ゴールの画像を表示
  var goal = new Image();
  goal.src = "../images/goal/text_goal.png"
  ctx.drawImage(goal, 760, 100, 32, 32);
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

// キーボードによるキャラクターの操作処理
function putKey(updatedImageX) {

  // Step1で追加
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

// 落下処理
function falling(x, y, vy, updatedX, updatedY) {
  var isJump = false;
  // 速度分追加
  updatedY = y + vy;

  // 落下速度を出す
  vy = vy + 0.5;

  // Step1で使用
  // if (updatedImageY + imageHeight > 432) {
  //   updatedImageY = 432 - imageHeight;
  //   isJump = false;
  // }

  // Step2以降使用
  // 地面に着地していたら着地。地面に着地していなかったら、そのまま落下。
  // キャラクターがいる地面の座標を取得する
  const positionWithCharacter =
    getPositionGroundWithCharacter(x, y, updatedX, updatedY);

  // キャラクターのいる地面の座標を取得できたら、着地処理。
  if (positionWithCharacter !== null) {
    updatedY = positionWithCharacter.y - imageHeight;
  } else {
    isJump = true;
  }
  return [updatedY, vy, isJump];

}

// キャラクターのいる地面の座標を取得。なければnullを返却
function getPositionGroundWithCharacter(x, y, updatedX, updatedY) {
  // 全てのブロックに対して繰り返し処理をする
  for (var i = 0; i < grounds.length; i++) {
    if (y + imageHeight <= grounds[i].y && updatedY + imageHeight >= grounds[i].y) {
      if (
        (x + imageHeight <= grounds[i].x || x >= grounds[i].x + grounds[i].w) &&
        (updatedX + imageHeight <= grounds[i].x || updatedX >= grounds[i].x + grounds[i].w)
      ) {
        // ブロックの上にいない場合には何もしない
        continue;
      }
      // ブロックの上にいる場合には、そのブロック要素を返す
      return grounds[i];
    }
  }
  // 最後までブロック要素を返さなかった場合はブロック要素の上にいないということなのでnullを返却する
  return null;
}

/**
 * 2つの要素(A, B)に重なる部分があるか否かをチェックする
 * 要素Aの左上の角の座標を(ax, ay)、幅をaw, 高さをahとする
 * 要素Bの左上の角の座標を(bx, by)、幅をbw, 高さをbhとする
 */
function isAreaOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  // A要素の左側の側面が、Bの要素の右端の側面より、右側にあれば重なり得ない
  if (bx + bw < ax) {
    return false;
  }
  // B要素の左側の側面が、Aの要素の右端の側面より、右側にあれば重なり得ない
  if (ax + aw < bx) {
    return false;
  }

  // A要素の上側の側面が、Bの要素の下端の側面より、下側にあれば重なり得ない
  if (by + bh < ay) {
    return false;
  }
  // B要素の上側の側面が、Aの要素の下端の側面より、上側にあれば重なり得ない
  if (ay + ah < by) {
    return false;
  }

  // ここまで到達する場合には、どこかしらで重なる
  return true;
}