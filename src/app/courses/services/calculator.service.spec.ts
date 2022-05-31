// run the test: ng test
// run the test not in the watching mode: ng test --no-watch

import { TestBed } from "@angular/core/testing";
import { CalculatorService } from "./calculator.service";
import { LoggerService } from "./logger.service";


describe('CalculatorService', () => {

    it('should add two numbers', () => {
        // first create a instance of the service
        const logger = new LoggerService();
        const calculator = new CalculatorService(logger);

        // test the LoggerService is only triggered once
        spyOn(logger, 'log');

        // test the result is true
        const result = calculator.add(2, 2);

        expect(result).toBe(4);
        expect(logger.log).toHaveBeenCalledTimes(1);
    });

    it('should subtract two numbers', () => {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // preffered way:
        // In unit test, only focus on the current service,
        // other denpendencies should be mocked or faked
        // to make sure that the unit test only failed because of the current service
        const logger = jasmine.createSpyObj('LoggerService', ['log']);
        const calculator = new CalculatorService(logger);

        // test the result is true
        const result = calculator.subtract(2, 2);
        expect(result).toBe(0, "unexpected subtraction result");
        expect(logger.log).toHaveBeenCalledTimes(1);
    });

})

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// better stuctured test
describe('CalculatorService with better structure', () => {

    let calculator: CalculatorService;
    let loggerSpy: any;

    beforeEach(() => {
        loggerSpy = jasmine.createSpyObj('LoggerService', ['log']);

        // dependency injection
        TestBed.configureTestingModule({
            providers: [
                CalculatorService,
                { provide: LoggerService, useValue: loggerSpy }
            ]
        });

        calculator = TestBed.get(CalculatorService);
    });

    it('should add two numbers', () => {
        const result = calculator.add(2, 2);
        expect(result).toBe(4);
        expect(loggerSpy.log).toHaveBeenCalledTimes(1);
    });

    it('should subtract two numbers', () => {
        const result = calculator.subtract(2, 2);
        expect(result).toBe(0, "unexpected subtraction result");
        expect(loggerSpy.log).toHaveBeenCalledTimes(1);
    });

})