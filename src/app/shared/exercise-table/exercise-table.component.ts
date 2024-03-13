import { SelectionModel } from '@angular/cdk/collections';
import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { ExerciseRow } from 'src/app/models/submissions-table-row.model';

@Component({
  selector: 'app-exercise-table',
  templateUrl: './exercise-table.component.html',
  styleUrls: ['./exercise-table.component.css']
})
export class ExerciseTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() exercises: Array<ExerciseRow>;
  @Input() displayedColumns: string[] = ['exercise', 'date', 'deadline'];
  @Input() optionalColumns: string[] = ['repoName'];
  @Input() includeFiltering: boolean;
  @Input() includePaginating: boolean;

  dataSource: MatTableDataSource<ExerciseRow> = new MatTableDataSource();
  selection = new SelectionModel<ExerciseRow>(true, []);

  filterTableFormGroup: FormGroup;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private _unsubscribe = new Subject<void>();
  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private fb: FormBuilder) {

    this.mobileQuery = this.media.matchMedia('(max-width: 700px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exercises && this.exercises) {
      this.exercises.sort((a: ExerciseRow, b: ExerciseRow) => a.deadline.getTime() - b.deadline.getTime());
      this.dataSource.data = this.exercises;
    }
  }

  ngOnInit(): void {
    if (this.includeFiltering) {
      this.filterTableFormGroup = this.fb.group({
        filter: [null, null]
      });
    }
   }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    if (this.includeFiltering) {
      this.filterTableFormGroup.controls['filter'].valueChanges
      .pipe(
        tap((e) => { console.log(e) }),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe) // once _unsubscribe is applied, stop the listener
      )
      .subscribe((value: string) => {
        if (!(value === null || value === undefined)) {
          value = value.trim().toLowerCase();
          this.dataSource.filter = value;
        }
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ExerciseRow): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  trackByFn(submission: ExerciseRow) {
    return submission.id;
  }

  getDisplayedColumns() {
    return this.mobileQuery.matches ? this.getMobileColumns() : this.displayedColumns;
  }

  getMobileColumns(): string[] {
    return this.displayedColumns.filter((column: string) => !this.optionalColumns.includes(column));
  }

}
