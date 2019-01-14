/**
 * 移动端左右滑动组件
 * 参考链接：
 *          [移动应用滑动屏幕方向判断解决方案,JS判断手势方向](https://blog.csdn.net/iwasdream/article/details/33741859)
 */
class Swiper {
    constructor(boxId, indexId) {
        this.box = document.getElementById(boxId); // 盒子节点
        this.boxWidth = this.box.offsetWidth;   // 外部包裹盒子的宽度

        this.slide = this.box.getElementsByClassName('slide')[0];
        this.slideLen = this.slide.getElementsByTagName('li').length;   // 滑动元素的个数
        this.slide.style.width = this.boxWidth * this.slideLen + 'px';  // 滑动节点的总宽度

        this.indexNode = document.getElementById(indexId);  // 索引节点
        this.indexNode.innerHTML = '';

        this.startX = '';
        this.startY = '';
        this.currentIndex = 1;
        this.turnTag = 0; // -1,左边第一个，0-正常的，1，右边最后一个

        // 事件this绑定
        this._touchStart = this._touchStart.bind(this);
        this._touchEnd = this._touchEnd.bind(this);
        this._transitionEnd = this._transitionEnd.bind(this);

        this.init()
    }

    /**
     * 初始化
     */
    init () {
        this.slide.style['transform'] = 'translateX(0px)';
        this._removeEventBind()
        if (this.slideLen > 1) {
            this._bindEvent()
            this._genIndexDom()
            this._addRollDom()
        }
    }

    /**
     * 移除原有的事件绑定
     * @private
     */
    _removeEventBind () {
        // 删除事件绑定
        this.box.removeEventListener('touchstart',this._touchStart, false)
        this.box.removeEventListener('touchend', this._touchEnd, false)
        this.slide.removeEventListener('transitionend', this._transitionEnd, false)
    }

    /**
     * 添加事件绑定
     * @private
     */
    _bindEvent () {
        this.box.addEventListener('touchstart',this._touchStart, false)
        this.box.addEventListener('touchend', this._touchEnd, false)
        this.slide.addEventListener('transitionend', this._transitionEnd, false)
    }

    /**
     * 复制最后一个节点到最前面，复制第一个节点到最后面，以实现循环滑动
     * @private
     */
    _addRollDom () {
        let dupLastNode = this.slide.children[this.slideLen-1].cloneNode(true);
        let dupFirstNode = this.slide.children[0].cloneNode(true);
        this.slide.insertBefore(dupLastNode, this.slide.children[0]);
        this.slide.appendChild(dupFirstNode);
        this.slide.style.width = this.boxWidth * (this.slideLen + 2) + 'px';
        this.slide.style['transform'] = 'translateX(-'+ this.boxWidth +'px)';
        this.slide.style['transition'] = 'transform .5s';
    }

    /**
     * 生成索引DOM节点
     * @private
     */
    _genIndexDom () {
        let ctx = '';
        for (let i=0; i< this.slideLen; i++) {
            if (i === 0) {
                ctx += '<li class="current-slide"></li>'
            } else {
                ctx += '<li></li>'
            }
        }
        this.indexNode.innerHTML = ctx
    }

    /**
     * transition效果执行完后触发的事件
     * @private
     */
    _transitionEnd () {
        if (this.turnTag === 1) {
            this.slide.style['transition'] = '';
            this.slide.style['transform'] = 'translateX(-'+ this.boxWidth +'px)';
            setTimeout(()=>{
                this.turnTag = 0
                this.slide.style['transition'] = 'transform .5s';
            }, 0)
        } else if (this.turnTag === -1) {
            this.slide.style['transition'] = '';
            this.slide.style['transform'] = 'translateX(-'+ (this.boxWidth * this.slideLen) +'px)';
            setTimeout(()=>{
                this.turnTag = 0
                this.slide.style['transition'] = 'transform .5s';
            }, 0)
        } else {
            this.slide.style['transition'] = 'transform .5s';
        }
    }

    /**
     * 设置当前序号
     * @private
     */
    _setIndex () {
        let index = this.currentIndex
        if (this.indexNode.getElementsByClassName('current-slide')[0]) {
            this.indexNode.getElementsByClassName('current-slide')[0].classList.remove('current-slide');
        }
        this.indexNode.getElementsByTagName('li')[index-1].classList.add('current-slide');
    }

    /**
     * 向左滑动的逻辑处理
     * @private
     */
    _dealLeft () { // 左+
        // 灵敏度调整,setTimeout时间
        if( this.turnTag !== 0) {
            return
        }
        if (this.currentIndex === this.slideLen) {
            this.currentIndex = 1;
            this.turnTag = 1
            this.slide.style['transform'] = 'translateX(-'+ (this.boxWidth * (this.slideLen + 1)) +'px)';
        } else {
            this.turnTag = 0
            this.currentIndex = this.currentIndex + 1
            this.slide.style['transform'] = 'translateX(-'+ (this.boxWidth * this.currentIndex) +'px)';
        }
        this._setIndex()
    }

    /**
     * 向右滑动的逻辑处理
     * @private
     */
    _dealRight () { // 右-
        if( this.turnTag !== 0) {
            return
        }
        if (this.currentIndex === 1) {
            this.currentIndex = this.slideLen
            this.turnTag = -1
            this.slide.style['transform'] = 'translateX(0px)';
        } else {
            this.turnTag = 0
            this.currentIndex = this.currentIndex - 1
            this.slide.style['transform'] = 'translateX(-'+ (this.boxWidth * this.currentIndex) +'px)';
        }
        this._setIndex()
    }

    _touchStart (e) {
        this.startX = e.touches[0].pageX;
        this.startY = e.touches[0].pageY;
    }

    _touchEnd (e) {
        let endX = e.changedTouches[0].pageX;
        let endY = e.changedTouches[0].pageY;
        let direction = this._getSlideDirection(this.startX, this.startY, endX, endY);
        if (direction === 2) {// 左-加
            this._dealLeft()
        }else if (direction === 1) {// 右-加
            this._dealRight()
        }
    }

    /**
     * 获取滑动的方向
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @returns {number}
     * @private
     */
    _getSlideDirection(startX, startY, endX, endY) {
        var dy = startY - endY;
        var dx = endX - startX;
        var result = 0;

        //如果滑动距离太短
        if(Math.abs(dx) < 2 && Math.abs(dy) < 2) {
            return result;
        }
        var angle = Math.atan2(dx, dy) * 180 / Math.PI; // 返回角度
        if(angle >= -45 && angle < 45) {
            result = 4;
        }else if (angle >= 45 && angle < 135) {
            result = 1;
        }else if (angle >= -135 && angle < -45) {
            result = 2;
        }
        else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
            result = 3;
        }
        return result;
    }
}