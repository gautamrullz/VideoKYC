// import {nets, detectAllFaces,detectSingleFace, euclideanDistance, fetchImage, SsdMobilenetv1Options,isMediaLoaded } from 'face-api.js'
import * as faceapi from 'face-api.js';
import { Component, ElementRef, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { observable, Observable, Subject } from 'rxjs';

import * as fs from 'fs';
// import { DrawBox } from 'face-api.js/build/commonjs/draw';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild("video")
  public video!: ElementRef;
  @ViewChild("canvas")
  public canvas!: ElementRef;
  @ViewChild("checksrc")
  public checksrc!: ElementRef;
  streams: any;
  title = 'VideoKYC';
  img = new Image();
  image!: HTMLImageElement;
  public imagePath: any;
  imgURL: any;
  // checksrc!:HTMLImageElement;
  // image: HTMLImageElement;
  // video: any;

  // private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  constructor() {

  }
  async ngOnInit() {
    try {

      await Promise.all([
        await faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/models'),
        await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
        await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
        await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
        // await faceapi.loadFaceDetectionModel('/assets/models'),
        // await faceapi.loadSsdMobilenetv1Model('/assets/models'),
        // await faceapi.loadFaceLandmarkModel('/assets/models'),
        // await faceapi.loadFaceRecognitionModel('/assets/models'),
      ]).then( await this.loadFunction);

    } catch (error) {
      console.error(error)
    }

  }

  loadFunction(loadFunction: any) {
    console.log(loadFunction);
    console.log("loded");
    throw new Error('Function not implemented.');
  }
  
  startCamera() {

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.streams = this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      });
    }

  }
  stopCamera() {
    const tracks = this.streams.getTracks();

    tracks.forEach(function (track: any) {
      track.stop();
    });
    this.streams = null;

  }
  async capture() {

    const videoWidth = this.video.nativeElement.videoWidth;
    const videoHeight = this.video.nativeElement.videoHeight;
    this.canvas.nativeElement.width = videoWidth
    this.canvas.nativeElement.height = videoHeight
    this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, 200, 200);
    const dd = this.canvas.nativeElement.toDataURL('image/jpeg');
    (blob: any) => {
      this.img.src = window.URL.createObjectURL(blob);
    };
  }

  async upload(event: any) {
    console.log(event.target.files[0])
    var reader = new FileReader();
    this.imagePath = event.target;
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
    this.image =await faceapi.bufferToImage(this.imagePath.files[0]); 
    console.log(this.image);
    //  event.target.files[0]
  }

  async find() {
    const canvas1 = faceapi.createCanvasFromMedia(this.image)
    this.canvas.nativeElement.appendChild(canvas1);
    const displaySize = { width: this.image.width, height: this.image.height }
    faceapi.matchDimensions(canvas1, displaySize)
    const fullFaceDescriptions = await faceapi.detectAllFaces(this.image).withFaceLandmarks().withFaceDescriptors()
    console.log((fullFaceDescriptions).length);
    const resizeDetection = faceapi.resizeResults(fullFaceDescriptions, displaySize)
    resizeDetection.forEach(detection => {
      const box = detection.detection.box
      const drowBox = new faceapi.draw.DrawBox(box);
      drowBox.draw(canvas1);
    })
    const detections1 = await faceapi.detectAllFaces(this.image, new faceapi.SsdMobilenetv1Options())
    console.log(detections1);
  }

}


