import { LocalStorageService } from './../local-storage.service';
import { ApiService } from './../api.service';
import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  @Input() post: any;

  constructor(private api: ApiService, private storage: LocalStorageService) {}

  public fakeId = 'fakeid';
  public fontSize = 18;
  public align = 'left';
  public liked = false;
  public userId = '';
  public comment = '';

  ngOnInit(): void {
    function removeLeadingNumber(id: any) {
      function isNumber(n: number) {
        n = Number(n);
        if (!isNaN(n)) {
          return true;
        }
      }
      if (id && isNumber(id[0])) {
        id = removeLeadingNumber(id.substr(1));
      }
      return id;
    }
    this.fakeId = removeLeadingNumber(this.post._id);

    if (this.post.content.length < 40) {
      this.fontSize = 22;
    }
    if (this.post.content.length < 24) {
      this.align = 'center';
      this.fontSize = 28;
    }
    if (this.post.content.length < 14) {
      this.fontSize = 32;
    }
    if (this.post.content.length < 8) {
      this.fontSize = 44;
    }
    if (this.post.content.length < 5) {
      this.fontSize = 62;
    }
    this.userId = this.storage.getParsedToken()._id;
    if (this.post.likes.includes(this.userId)) {
      this.liked = true;
    }
  }
  public likeButtonClicked(postid: any) {
    const requestObject = {
      location: `users/like-unlike/${this.post.ownerid}/${this.post._id}`,
      type: 'POST',
      authorize: true,
    };

    this.api.makeRequest(requestObject).then((_: any) => {
      if (this.post.likes.includes(this.userId)) {
        this.post.likes.splice(this.post.likes.indexOf(this.userId), 1);
        this.liked = false;
      } else {
        this.post.likes.push(this.userId);
        this.liked = true;
      }
    });
  }

  public postComment() {
    if (this.comment.length === 0) {
      return;
    }
    const requestObject = {
      location: `users/post-comment/${this.post.ownerid}/${this.post._id}`,
      type: 'POST',
      authorize: true,
      body: { content: this.comment },
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.statusCode === 201) {
        const newComment = {
          ...val.comment,
          commenter_name: val.commenter.name,
          commenter_image: val.commenter.profile_image,
        };
        this.post.comments.push(newComment);
        this.comment = '';
      }
    });
  }
}
