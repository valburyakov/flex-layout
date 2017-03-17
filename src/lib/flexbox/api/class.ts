/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ElementRef,
  Input,
  DoCheck,
  OnDestroy,
  Renderer,
  IterableDiffers,
  KeyValueDiffers, SimpleChanges, OnChanges
} from '@angular/core';
import {NgClass} from '@angular/common';

import {BaseFxDirectiveAdapter} from './base-adapter';
import {MediaChange} from '../../media-query/media-change';
import {MediaMonitor} from '../../media-query/media-monitor';

/** NgClass allowed inputs **/
export type NgClassType = string | string[] | Set<string> | {[klass: string]: any};

/**
 * Directive to add responsive support for ngClass.
 */
@Directive({
  selector: `
    [class], [class.xs], [class.sm], [class.md], [class.lg], [class.xl], 
    [class.lt-sm], [class.lt-md], [class.lt-lg], [class.lt-xl],     
    [class.gt-xs], [class.gt-sm], [class.gt-md], [class.gt-lg],        
    [ngClass], [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],
    [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl], 
    [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]  
  `
})
export class ClassDirective extends NgClass implements DoCheck, OnChanges, OnDestroy {

  /**
   * Intercept ngClass assignments so we cache the default classes
   * which are merged with activated styles or used as fallbacks.
   * Note: Base ngClass values are applied during ngDoCheck()
   */
  @Input('ngClass')
  set ngClassBase(val: NgClassType) {
    this._base.cacheInput('class', val, true);
    this.ngClass = val;
  }

  /* tslint:disable */
  @Input('ngClass.xs')    set ngClassXs(val: NgClassType) { this._base.cacheInput('classXs', val, true); }
  @Input('ngClass.sm')    set ngClassSm(val: NgClassType) {  this._base.cacheInput('classSm', val, true); };
  @Input('ngClass.md')    set ngClassMd(val: NgClassType) { this._base.cacheInput('classMd', val, true); };
  @Input('ngClass.lg')    set ngClassLg(val: NgClassType) { this._base.cacheInput('classLg', val, true);};
  @Input('ngClass.xl')    set ngClassXl(val: NgClassType) { this._base.cacheInput('classXl', val, true); };

  @Input('ngClass.lt-xs') set ngClassLtXs(val: NgClassType) { this._base.cacheInput('classLtXs', val, true); };
  @Input('ngClass.lt-sm') set ngClassLtSm(val: NgClassType) { this._base.cacheInput('classLtSm', val, true);} ;
  @Input('ngClass.lt-md') set ngClassLtMd(val: NgClassType) { this._base.cacheInput('classLtMd', val, true);};
  @Input('ngClass.lt-lg') set ngClassLtLg(val: NgClassType) { this._base.cacheInput('classLtLg', val, true); };

  @Input('ngClass.gt-xs') set ngClassGtXs(val: NgClassType) { this._base.cacheInput('classGtXs', val, true); };
  @Input('ngClass.gt-sm') set ngClassGtSm(val: NgClassType) { this._base.cacheInput('classGtSm', val, true);} ;
  @Input('ngClass.gt-md') set ngClassGtMd(val: NgClassType) { this._base.cacheInput('classGtMd', val, true);};
  @Input('ngClass.gt-lg') set ngClassGtLg(val: NgClassType) { this._base.cacheInput('classGtLg', val, true); };

  /** Deprecated selectors */

  /**
   * Base class selector values get applied immediately
   *
   * Delegate to NgClass setter and cache value for
   * base fallback from responsive APIs.
   */
  @Input('class')
  set classBase(val: string) {
    this.klass = val;
    this._base.cacheInput('_rawClass', val, true);
  }

  @Input('class.xs')      set classXs(val: NgClassType) { this._base.cacheInput('classXs', val, true); }
  @Input('class.sm')      set classSm(val: NgClassType) {  this._base.cacheInput('classSm', val, true); };
  @Input('class.md')      set classMd(val: NgClassType) { this._base.cacheInput('classMd', val, true);};
  @Input('class.lg')      set classLg(val: NgClassType) { this._base.cacheInput('classLg', val, true); };
  @Input('class.xl')      set classXl(val: NgClassType) { this._base.cacheInput('classXl', val, true); };

  @Input('class.lt-xs')   set classLtXs(val: NgClassType) { this._base.cacheInput('classLtXs', val, true); };
  @Input('class.lt-sm')   set classLtSm(val: NgClassType) { this._base.cacheInput('classLtSm', val, true); };
  @Input('class.lt-md')   set classLtMd(val: NgClassType) { this._base.cacheInput('classLtMd', val, true);};
  @Input('class.lt-lg')   set classLtLg(val: NgClassType) { this._base.cacheInput('classLtLg', val, true); };

  @Input('class.gt-xs')   set classGtXs(val: NgClassType) { this._base.cacheInput('classGtXs', val, true); };
  @Input('class.gt-sm')   set classGtSm(val: NgClassType) { this._base.cacheInput('classGtSm', val, true); };
  @Input('class.gt-md')   set classGtMd(val: NgClassType) { this._base.cacheInput('classGtMd', val, true);};
  @Input('class.gt-lg')   set classGtLg(val: NgClassType) { this._base.cacheInput('classGtLg', val, true); };

  /**
   * Initial value of the `class` attribute; used as
   * fallback and will be merged with nay `ngClass` values
   */
  get initialClasses() : string {
    return  this._base.queryInput('_rawClass') || "";
  }

  /* tslint:enable */
  constructor(protected monitor: MediaMonitor,
              _iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers,
              _ngEl: ElementRef, _renderer: Renderer) {
    super(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer);
    this._base = new BaseFxDirectiveAdapter('class', monitor, _ngEl, _renderer);
  }

  // ******************************************************************
  // Lifecycle Hookks
  // ******************************************************************

  /**
   * For @Input changes on the current mq activation property
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this._base.activeKey in changes) {
      this._updateClass();
    }
  }

  /**
   * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
   */
  ngDoCheck() {
    if (!this._base.hasMediaQueryListener) {
      this._configureMQListener();
    }
    super.ngDoCheck();
  }

  ngOnDestroy() {
    this._base.ngOnDestroy();
  }

  // ******************************************************************
  // Internal Methods
  // ******************************************************************

  /**
   * Build an mqActivation object that bridges
   * mql change events to onMediaQueryChange handlers
   */
  protected _configureMQListener() {
    this._base.listenForMediaQueryChanges('class', '', (changes: MediaChange) => {
      this._updateClass(changes.value);

      // trigger NgClass::_applyIterableChanges()
      super.ngDoCheck();
    });
  }

  /**
   *
   */
  protected _updateClass(value?: NgClassType) {
    let clazz = value || this._base.queryInput('class') || '';
    if (this._base.mqActivation) {
      clazz = this._base.mqActivation.activatedInput;
    }
    // Delegate subsequent activity to the NgClass logic
    this.ngClass = clazz || this.initialClasses;
  }

  /**
   * Special adapter to cross-cut responsive behaviors
   * into the ClassDirective
   */
  protected _base: BaseFxDirectiveAdapter;
}

