import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperatorDecisionTree } from './interfaces';

@Injectable()
export class OperatorDecisionTreeDataService {
  constructor(private http: HttpClient) {}

  getDecisionTree$(): Observable<OperatorDecisionTree> {
    return this.http.get<OperatorDecisionTree>(
      '/generated/docs/app/decision-tree-data.json'
    );
  }
}
