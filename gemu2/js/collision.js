/**
 * 衝突判定ユーティリティモジュール
 */

/**
 * 2つの軸平行バウンディングボックス (AABB) が交差しているかを判定する
 * @param {{x: number, y: number, width: number, height: number}} a 
 * @param {{x: number, y: number, width: number, height: number}} b 
 * @returns {boolean}
 */
export function intersects(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * 複数の判定ボックス群同士が1つでも衝突しているか判定する
 * @param {Array<{x: number, y: number, width: number, height: number}>} listA 
 * @param {Array<{x: number, y: number, width: number, height: number}>} listB 
 * @returns {boolean}
 */
export function checkMultiCollision(listA, listB) {
    for (let i = 0; i < listA.length; i++) {
        for (let j = 0; j < listB.length; j++) {
            if (intersects(listA[i], listB[j])) {
                return true;
            }
        }
    }
    return false;
}

/**
 * デバッグ用: ヒットボックスを描画する
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array<{x: number, y: number, width: number, height: number}>} hitboxes 
 * @param {string} color 
 */
export function renderHitboxes(ctx, hitboxes, color = 'rgba(255, 0, 0, 0.4)') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color.replace('0.4', '0.9');
    ctx.lineWidth = 1;
    for (const box of hitboxes) {
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
    ctx.restore();
}
