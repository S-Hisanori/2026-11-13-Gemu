/**
 * DINO RUNNER - メインエントリーポイント
 */

import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const canvasContainer = document.getElementById('canvas-container');

    const uiElements = {
        titleScreen: document.getElementById('title-screen'),
        gameOverScreen: document.getElementById('game-over-screen'),
        startButton: document.getElementById('start-button'),
        retryButton: document.getElementById('retry-button'),
        currentScoreText: document.getElementById('current-score-display'),
        highScoreText: document.getElementById('high-score-display'),
        finalScoreText: document.getElementById('final-score'),
        newRecordBadge: document.getElementById('new-record-badge')
    };

    // ゲームインスタンス生成
    const game = new Game(canvas, uiElements);

    // ============================================================
    // イベントリスナー設定
    // ============================================================

    // 1. キーボード操作 (Space / ArrowUp)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            // Spaceキー等によるブラウザの縦スクロールを防止
            e.preventDefault();

            // キー押しっぱなしによる連続入力バグを防止
            if (!e.repeat) {
                game.handleAction();
            }
        }
    });

    // 2. マウス / タッチ操作 (画面タップ・クリック)
    canvasContainer.addEventListener('pointerdown', (e) => {
        // スタートボタンやリトライボタンの通常クリックと重複しないようチェック
        if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            game.handleAction();
        }
    });

    // 3. UIボタン操作
    uiElements.startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        game.handleAction();
    });

    uiElements.retryButton.addEventListener('click', (e) => {
        e.stopPropagation();
        game.handleAction();
    });

    // 4. ウィンドウリサイズ対応 (Retina比率・解像度同期)
    window.addEventListener('resize', () => {
        game.initCanvasSize();
    });

    // ============================================================
    // ゲームループ (requestAnimationFrame)
    // ============================================================
    let lastTime = performance.now();

    function gameLoop(currentTime) {
        // 前フレームからの経過秒数 (deltaTime) を算出
        let deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // タブ非アクティブ等で巨大なデルタタイムが生じるのを防ぐガード (最大0.1秒)
        if (deltaTime > 0.1) {
            deltaTime = 0.1;
        }

        // 更新と描画
        game.update(deltaTime);
        game.render();

        requestAnimationFrame(gameLoop);
    }

    // 初回描画 & ループ開始
    game.render();
    requestAnimationFrame(gameLoop);
});
