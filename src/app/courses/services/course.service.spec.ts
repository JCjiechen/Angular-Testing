import { TestBed } from "@angular/core/testing";
import { CoursesService } from "./courses.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { COURSES } from "../../../../server/db-data";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";
import {findLessonsForCourse} from "../../../../server/db-data"


describe("CourseService", () => {

    let coursesService: CoursesService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            // provide a mock implementation of an HTTP client 
            // that is goint to return test data
            imports: [HttpClientTestingModule],
            providers: [CoursesService]
        });

        coursesService = TestBed.get(CoursesService);
        httpTestingController = TestBed.get(HttpTestingController);
    });

    it('should retrieve all courses', () => {
        coursesService.findAllCourses().subscribe(courses => {
            // the service should not return null, undefined, etc...
            expect(courses).toBeTruthy('No courses returned');
            // test the number of the courses
            expect(courses.length).toBe(12, 'Incorrect number of courses');
            // test the content of the courses
            const course = courses.find(course => course.id === 12);
            expect(course.titles.description).toBe('Angular Testing Course');
        });

        // create mock http request
        const req = httpTestingController.expectOne('/api/courses');
        expect(req.request.method).toEqual("GET");

        // in terminal run: npm run server
        // go to http://localhost:9000/api/courses
        // This is the data returned here by our server 
        req.flush({ payload: Object.values(COURSES) });
    });

    it('should find a course by id', () => {
        coursesService.findCourseById(12).subscribe(course => {
            expect(course).toBeTruthy();
            expect(course.id).toBe(12);
        })

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("GET");
        req.flush(COURSES[12]);
    });

    it('should sace course data', () => {
        const changes: Partial<Course> = { titles: { description: 'Testing Course' } };
        coursesService.saveCourse(12, changes).subscribe(course => {
            expect(course.id).toBe(12);
        })

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
        expect(req.request.body.titles.description).toEqual(changes.titles.description);
        req.flush({ ...COURSES[12], ...changes});
    });

    it('should give an error if save course fails', () => {
        const changes: Partial<Course> = { titles: { description: 'Testing Course' } };
        coursesService.saveCourse(12, changes).subscribe(() => {
            fail("the save course operation should have failed"),
                (error: HttpErrorResponse) => {
                    expect(error.status).toBe(500);
                }
        });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
        req.flush('Save course fialed', {status:500, statusText:'Internal Server Error'});
    });

    it('should find a list of lessons', () => {
        coursesService.findLessons(12).subscribe(lessons => {
            expect(lessons).toBeTruthy();
            expect(lessons.length).toBe(3);
        });

        const req = httpTestingController.expectOne(req => req.url == '/api/lessons');
        expect(req.request.method).toEqual("GET");
        expect(req.request.params.get("courseId")).toEqual("12");
        expect(req.request.params.get("filter")).toEqual("");
        expect(req.request.params.get("sortOrder")).toEqual("asc");
        expect(req.request.params.get("pageNumber")).toEqual("0");
        expect(req.request.params.get("pageSize")).toEqual("3");

        req.flush({payload:findLessonsForCourse(12).slice(0,3)});
    });

    afterEach(()=> {
        httpTestingController.verify();
    })
});