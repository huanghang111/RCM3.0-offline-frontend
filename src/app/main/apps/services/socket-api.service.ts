import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Observable, Observer} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SocketApiService {

    // webSocketEndPoint: string = 'http://localhost:8080/rcm';
    // topic: string = "/topic/signalData";
    webSocketEndPoint: string;
    currentTopic: string = '';
    isMultiple: boolean = false;
    stompClient: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    subscriber = null;
    subscriber2 = null;
    timeout: any;

    isNewPage: boolean = false;

    constructor(private router: Router) {
        let url: string = window.location.host;
        if (url.indexOf(':') > 0) {
            url = url.substr(0, url.indexOf(':'));
        }
        this.webSocketEndPoint = `//${url}:8082/rcm`;

        router.events.forEach(event => {
            if (event instanceof NavigationEnd) {
                this.isNewPage = true;
            }
        });

        this.listener = this.createListener();
    }

    _connect(topicURL: string, isMultipleTopic: boolean) {
        this._disconnect();

        this.currentTopic = topicURL;
        this.isMultiple = isMultipleTopic;
        // console.log('Initialize WebSocket Connection for topic:' + this.currentTopic);
        let ws = new SockJS(this.webSocketEndPoint);
        this.stompClient = Stomp.over(ws);
        this.stompClient.debug = () => {
        }; // disable debug console.log of stompjs
        const headers = {};
        this.stompClient.connect(headers, () => {
            // console.log('Connect success!!!');
            this.subscriber = this.stompClient.subscribe(this.currentTopic, data => {
                this.listenerObserver.next(JSON.parse(data.body));
            });

            if (isMultipleTopic) {
                this.subscriber2 = this.stompClient.subscribe('/topic/errorData', data => {
                    this.listenerObserver.next(JSON.parse(data.body));
                });
            }
        }, (error) => {
            console.log('errorCallBack with topic ' + this.currentTopic + ' with error: ' + error);
            if (!this.isNewPage) {
                console.log('Attemp to reconnect .....');
                this.timeout = setTimeout(() => {
                    this._connect(this.currentTopic, this.isMultiple);
                }, 5000);
            }
        });

    };

    _disconnect() {
        this.isNewPage = false;
        clearTimeout(this.timeout);
        try {
            if (this.stompClient != null) {
                this.stompClient.disconnect();
            }
        } catch (e) {
            console.log(e);
        }
        this.stompClient = null;
        // console.log('Topic ' + this.currentTopic + ' disconnected from socket.');
    }

    receive() {
        return this.listener;
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    isConnected(): boolean {
        return this.stompClient != null ? true : false;
    }
}
