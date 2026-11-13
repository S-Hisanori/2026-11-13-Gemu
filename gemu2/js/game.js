/**
 * ゲーム統括マネージャークラス
 */

import { Dino } from './dino.js';
import { Background } from './background.js';
import { ObstacleManager } from './obstacle.js';

export const GameState = {
    TITLE: 'TITLE',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER'
};

export class Game {
    constructor(canvas, uiElements) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = uiElements;

        // 論理解像度
        this.logicalWidth = 800;
        this.logicalHeight = 300;
        this.groundY = 250;

        // ゲームステート
        this.state = GameState.TITLE;

        // 速度パラメータ
        this.baseSpeed = 320;
        this.maxSpeed = 750;
        this.currentSpeed = this.baseSpeed;
        this.acceleration = 4.5; // 1秒あたりの速度増加量

        // スコア
        this.score = 0;
        this.highScore = this.loadHighScore();

        // ゲームオブジェクト
        this.dino = new Dino(this.groundY);
        this.background = new Background(this.logicalWidth, this.logicalHeight, this.groundY);
        this.obstacleManager = new ObstacleManager(this.logicalWidth, this.groundY);

        // 高DPIキャンバス初期化
        this.initCanvasSize();

        // 初期UI更新
        this.updateScoreUI();
    }

    /**
     * ハイスコアの読み込み
     * @returns {number}
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('dino_runner_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('localStorageアクセス不可:', e);
            return 0;
        }
    }

    /**
     * ハイスコアの保存
     * @param {number} newScore 
     */
    saveHighScore(newScore) {
        try {
            localStorage.setItem('dino_runner_highscore', newScore.toString());
        } catch (e) {
            console.warn('localStorage保存不可:', e);
        }
    }

    /**
     * 高DPI対応のCanvasサイズ設定
     */
    initCanvasSize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.logicalWidth * dpr;
        this.canvas.height = this.logicalHeight * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    /**
     * プレイヤーの共通アクション（キー入力、クリック、タップ）
     */
    handleAction() {
        switch (this.state) {
            case GameState.TITLE:
                this.startGame();
                break;
            case GameState.PLAYING:
                this.dino.jump();
                break;
            case GameState.GAMEOVER:
                this.startGame();
                break;
        }
    }

    /**
     * ゲーム開始・リスタート
     */
    startGame() {
        this.state = GameState.PLAYING;
        this.currentSpeed = this.baseSpeed;
        this.score = 0;

        this.dino.reset();
        this.obstacleManager.reset();

        // UI切り替え
        this.ui.titleScreen.classList.remove('active');
        this.ui.titleScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.remove('active');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.newRecordBadge.classList.add('hidden');

        this.updateScoreUI();
    }

    /**
     * ゲームオーバー処理
     */
    triggerGameOver() {
        this.state = GameState.GAMEOVER;
        this.dino.isDead = true;

        const isNewRecord = Math.floor(this.score) > this.highScore;
        if (isNewRecord) {
            this.highScore = Math.floor(this.score);
            this.saveHighScore(this.highScore);
            this.ui.newRecordBadge.classList.remove('hidden');
        }

        // ゲームオーバーUI表示
        this.ui.finalScoreText.textContent = this.formatScore(this.score);
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.gameOverScreen.classList.add('active');

        this.updateScoreUI();
    }

    /**
     * メイン更新処理
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // 背景と恐竜はタイトル・プレイ中問わずアニメーション
        if (this.state === GameState.PLAYING) {
            // スコア加算 (速度に連動)
            this.score += (this.currentSpeed * 0.035) * deltaTime;
            this.updateScoreUI();

            // 速度の加速
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * deltaTime);
            }

            // 背景更新
            this.background.update(deltaTime, this.currentSpeed);

            // 恐竜更新
            this.dino.update(deltaTime, this.currentSpeed);

            // 障害物更新
            this.obstacleManager.update(deltaTime, this.currentSpeed, Math.floor(this.score));

            // 衝突判定
            const hit = this.obstacleManager.checkCollision(this.dino.getHitboxes());
            if (hit) {
                this.triggerGameOver();
            }
        } else if (this.state === GameState.TITLE) {
            // タイトル画面中も雲だけゆっくり流れる
            this.background.update(deltaTime, 40);
        }
    }

    /**
     * スコア表示のフォーマット（5桁ゼロ埋め）
     * @param {number} value 
     * @returns {string}
     */
    formatScore(value) {
        return Math.floor(value).toString().padStart(5, '0');
    }

    /**
     * スコアHUD更新
     */
    updateScoreUI() {
        this.ui.currentScoreText.textContent = this.formatScore(this.score);
        this.ui.highScoreText.textContent = `HI ${this.formatScore(this.highScore)}`;
    }

    /**
     * 描画処理
     */
    render() {
        // 画面クリア
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

        // 1. 背景・地面・雲の描画
        this.background.render(this.ctx);

        // 2. 障害物の描画
        this.obstacleManager.render(this.ctx);

        // 3. 恐竜の描画
        this.dino.render(this.ctx);
    }
}
