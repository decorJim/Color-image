import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { URL } from '../../../../constants';
import { French, English } from '@app/interfaces/Langues';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { Logout2Component } from '../logout2/logout2.component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {
  @ViewChild('chatinput') input: any;
  @ViewChild('message-icon') chatzone: HTMLElement;
  private readonly BASE_URL: string = URL;

  public message = new Array<any>();
  public others = new Array<string>();
  public time = new Array<string>();

  public chatTitle: string;
  public roomChange: string;

  public source: string;
  public source2: string;
  public avatarCurrentUser:string;
  public avatarOtherUser:string;

  public currentNickname:String;

  public chatTITLE: string;


  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private router: Router,
    ) { 
    }

  ngAfterViewInit(): void {  
    this.chatTITLE = this.socketService.currentRoom;
    this.playAudio("ui2.wav")
    if(this.router.url == "/clavardage") {
      document.getElementById("principal")!.style.width = "100%";
    }
    else if(this.router.url == "/sidenav") {
      document.getElementById("principal")!.style.width = "500px";
    }

    if(this.socketService.language == "french") {
      this.chatTitle =  French.chatTitle;
      this.roomChange = French.changeRoom;
     }
     else {
       this.chatTitle =  English.chatTitle;
       this.roomChange = English.changeRoom;
     }
     if(this.socketService.theme == "light grey"){
      document.getElementById("title9")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title9")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title9")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title9")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title9")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title9")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title9")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title9")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title9")!.style.backgroundColor = LightPink.main;
      document.getElementById("title9")!.style.color = LightPink.text;
    }

    switch(this.socketService.avatarNumber) {
      case "1":{
        this.avatarCurrentUser="avatar1.png";
        break;
      }
      case "2":{
        this.avatarCurrentUser="avatar2.png";
        break;
      }
      case "3":{
        this.avatarCurrentUser="avatar3.png";
        break;
      }
      case "4":{
        this.avatarCurrentUser="avatar4.png";
        break;
      }
      case "5":{
        this.avatarCurrentUser="avatar5.png";
        break;
      }
        
    }
    console.info("AVATAR NUM FROM SOCKET",this.socketService.avatarNumber);
    this.avatarCurrentUser=this.socketService.avatarNumber;
    this.currentNickname=this.socketService.nickname;

    let link=this.BASE_URL+"message/getRoomMessages/" + `${this.socketService.currentRoom}`;  
    console.log("CHECK MOI HEHE:" + this.socketService.currentRoom);
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MM-yyyy HH:mm:ss') as string;

        if (this.socketService.nickname == data[i].nickname) {

          console.info("old msg",this.avatarOtherUser);
          console.info("old msg current",this.avatarCurrentUser);
      
          console.log(this.source);
          const msg={
            time:formattedDate,
            nickname:data[i].nickname,
            message:data[i].message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
            avatar:"av"+data[i].avatar+".png"
          } 
          this.message.push(msg);
 
        }

        if (this.socketService.nickname != data[i].nickname) {
   
          this.avatarOtherUser=data[i].avatar;


          console.info(this.avatarOtherUser);
          console.info(this.avatarCurrentUser);

          const msg={
            time:formattedDate,
            nickname:data[i].nickname,
            message:data[i].message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
            avatar:"av"+data[i].avatar+".png"
          } 
          this.message.push(msg);

        }
      }
    });

    this.socketService.getSocket().on("MSG", (data)=>{
      data = JSON.parse(data);
      this.playAudio("cell_notif.wav");
      console.log("socket room " + this.socketService.currentRoom.trim());
      console.log("data room " + data.roomName);
      console.log("avatar", data.msg.avatar);
      if (data.roomName == this.socketService.currentRoom.trim()) {
   
        console.log("get in bruh");

        this.avatarOtherUser=data.msg.avatar;


        console.info(this.avatarOtherUser);
        console.info(this.avatarCurrentUser);

        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;

        const msg={
          time:formattedDate,
          nickname:data.msg.nickname,
          message:data.msg.message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
          avatar:"av"+data.msg.avatar+".png"
        } 
        this.message.push(msg);

      }
      else if (data.roomName == this.socketService.currentRoom.trim()) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;
        const msg={
          time:formattedDate,
          nickname:data.msg.nickname,
          message:data.msg.message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
          avatar:"av"+data.msg.avatar+".png"
        } 
        this.message.push(msg);

      }
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  leaveDrawing() {
    console.log("current", this.socketService.currentRoom);

    let link = this.BASE_URL + "drawing/leaveDrawing";

    if(this.router.url == "/sidenav") {
      this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
        console.log("response", data);
        if(data.message == "success") {
          this.playAudio("ui2.wav");
          console.log("EXITED DRAWING" + data.useremail);
        }
      });
      this.router.navigate(['/', 'dessins']);
    }
  }

  changeRoom(): void {
    this.router.navigate(['/', 'rooms']);
    this.playAudio("ui2.wav");
    
   

    this.leaveDrawing();
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim() != '') {
      console.log("avatar", this.socketService.avatarNumber);
      const msg = { time: currentTime, nickname: this.socketService.nickname, message: text.trim(), avatar: this.socketService.avatarNumber };
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(currentTime, 'dd-MM-yyyy HH:mm:ss') as string;

      const msgDisplay={
        time:formattedDate,
        nickname:this.socketService.nickname,
        message:text.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
        avatar:"av"+this.avatarCurrentUser+".png"
      }

      console.log("display",msgDisplay.avatar);

      this.message.push(msgDisplay);

      this.playAudio("msg.wav");

      this.socketService.getSocket().emit("MSG",JSON.stringify(msg));

      this.input.nativeElement.value = ' ';
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    this.input.nativeElement.focus();
  }

  public userDataCall() { 
    let link=this.BASE_URL + "userData/msg";

    this.http.post<any>(link,{ msg:"sjdakjsd",user:"admin" }).subscribe((data: any) => {
      console.log(data);
    });
  }

  logout() {
    this.dialog.open(Logout2Component);
  }
}